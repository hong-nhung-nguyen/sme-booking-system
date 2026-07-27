import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    createAppointment,
    getAppointment,
    updateAppointment,
} from "../../schedule/api/appointment.api";
import { getServices } from "../../../shared/api/location.api";
import useLocations from "../../../shared/hooks/useLocations";
import useAuth, { actorName } from "../../auth/hooks/useAuth";
import PageLoader from "../../../shared/ui/PageLoader";
import Spinner from "../../../shared/ui/Spinner";
import { getClient, getId } from "../../../shared/lib/appointment";
import {
    combineDateAndTime,
    toDateInputValue,
    toTimeInputValue,
} from "../../../shared/lib/datetime";
import "./booking.css";
import "./BookingForm.css";

const CHANNELS = ["manual", "online", "sms", "email", "other"];

const emptyForm = {
    clientFirstName: "",
    clientLastName: "",
    clientPhone: "",
    clientEmail: "",
    locationId: "",
    serviceId: "",
    date: "",
    startTime: "",
    durationMins: "",
    partySize: "1",
    channel: "manual",
    note: "",
};

/**
 * Mirrors the Joi rules on src/api/v1/validations/tenant/appointment.validation.js
 * so the obvious mistakes are caught before the round-trip.
 */
function validate(form, isEdit) {
    const errors = {};

    if (!isEdit && !form.clientFirstName.trim()) {
        errors.clientFirstName = "Guest first name is required.";
    }

    if (
        !isEdit &&
        form.clientEmail.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.clientEmail.trim())
    ) {
        errors.clientEmail = "Enter a valid email address.";
    }

    if (
        !isEdit &&
        form.clientPhone.trim() &&
        !/^\+?[0-9\s-]{8,20}$/.test(form.clientPhone.trim())
    ) {
        errors.clientPhone = "Enter a valid phone number.";
    }

    if (!isEdit && !form.locationId) {
        errors.locationId = "Choose a location.";
    }

    if (!form.serviceId) {
        errors.serviceId = "Choose a service.";
    }

    if (!form.date) {
        errors.date = "Choose a date.";
    }

    if (!form.startTime) {
        errors.startTime = "Choose a start time.";
    }

    const partySize = Number(form.partySize);

    if (!Number.isInteger(partySize) || partySize < 1) {
        errors.partySize = "Party size must be at least 1.";
    }

    if (!isEdit) {
        const duration = Number(form.durationMins);

        if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
            errors.durationMins = "Duration must be between 5 and 480 minutes.";
        }
    }

    if (form.note.length > 1000) {
        errors.note = "Notes cannot be longer than 1000 characters.";
    }

    return errors;
}

export default function BookingForm() {
    const { appointmentId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isEdit = Boolean(appointmentId);

    const { locations, selectedLocationId, selectLocation } = useLocations();

    const [form, setForm] = useState(emptyForm);
    const [services, setServices] = useState([]);
    const [errors, setErrors] = useState({});
    const [serverErrors, setServerErrors] = useState([]);
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);

    // Create mode: seed from the schedule the user came from
    useEffect(() => {
        if (isEdit) return;

        setForm((current) => ({
            ...current,
            date: searchParams.get("date") || toDateInputValue(new Date()),
            locationId:
                current.locationId ||
                searchParams.get("locationId") ||
                selectedLocationId ||
                "",
        }));
    }, [isEdit, searchParams, selectedLocationId]);

    // Edit mode: prefill from the existing booking
    useEffect(() => {
        if (!isEdit) return;

        let cancelled = false;

        getAppointment(appointmentId)
            .then(({ data }) => {
                if (cancelled) return;

                const client = getClient(data);

                setForm({
                    clientFirstName: client?.firstName || "",
                    clientLastName: client?.lastName || "",
                    clientPhone: client?.phone || "",
                    clientEmail: client?.email || "",
                    locationId: getId(data.locationId) || "",
                    serviceId: getId(data.serviceId) || "",
                    date: data.date || "",
                    startTime: toTimeInputValue(data.startTime),
                    durationMins: String(data.durationMinutes || ""),
                    partySize: String(data.partySize || 1),
                    channel: data.channel || "manual",
                    note: data.note || "",
                });
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setServerError(
                        requestError.status === 404
                            ? "This booking no longer exists."
                            : requestError.message || "Unable to load this booking"
                    );
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [appointmentId, isEdit]);

    // Services depend on the chosen location
    useEffect(() => {
        if (!form.locationId) {
            setServices([]);
            return;
        }

        let cancelled = false;

        getServices(form.locationId)
            .then((response) => {
                if (!cancelled) setServices(response.services || []);
            })
            .catch(() => {
                if (!cancelled) setServices([]);
            });

        return () => {
            cancelled = true;
        };
    }, [form.locationId]);

    const selectedService = useMemo(
        () => services.find((service) => service._id === form.serviceId),
        [services, form.serviceId]
    );

    function updateField(name, value) {
        setForm((current) => ({ ...current, [name]: value }));
        setErrors((current) => ({ ...current, [name]: "" }));
        setServerError("");
        setServerErrors([]);
    }

    function handleChange(event) {
        updateField(event.target.name, event.target.value);
    }

    function handleLocationChange(event) {
        const locationId = event.target.value;

        selectLocation(locationId);

        // The previously chosen service may not exist at the new location
        setForm((current) => ({ ...current, locationId, serviceId: "" }));
        setErrors((current) => ({ ...current, locationId: "", serviceId: "" }));
    }

    function handleServiceChange(event) {
        const serviceId = event.target.value;
        const service = services.find((item) => item._id === serviceId);

        setForm((current) => ({
            ...current,
            serviceId,
            // Prefill the duration from the service, but never overwrite a
            // duration the user has already typed in.
            durationMins:
                current.durationMins ||
                String(service?.defaultDurationMinutes || ""),
        }));

        setErrors((current) => ({ ...current, serviceId: "" }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationErrors = validate(form, isEdit);

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSubmitting(true);
        setServerError("");
        setServerErrors([]);

        const startTime = combineDateAndTime(form.date, form.startTime).toISOString();

        try {
            if (isEdit) {
                /*
                 * The edit endpoint only accepts these fields — guest details
                 * live on the Client document and are not editable here.
                 */
                await updateAppointment(appointmentId, {
                    serviceId: form.serviceId,
                    date: form.date,
                    startTime,
                    partySize: Number(form.partySize),
                    channel: form.channel,
                    note: form.note,
                    updatedBy: actorName(user),
                });

                navigate(`/bookings/${appointmentId}`, { replace: true });

                return;
            }

            const response = await createAppointment({
                locationId: form.locationId,
                clientFirstName: form.clientFirstName.trim(),
                ...(form.clientLastName.trim() && {
                    clientLastName: form.clientLastName.trim(),
                }),
                ...(form.clientPhone.trim() && {
                    clientPhone: form.clientPhone.trim(),
                }),
                ...(form.clientEmail.trim() && {
                    clientEmail: form.clientEmail.trim(),
                }),
                serviceId: form.serviceId,
                date: form.date,
                startTime,
                durationMins: Number(form.durationMins),
                partySize: Number(form.partySize),
                channel: form.channel,
                note: form.note,
                createdBy: actorName(user),
            });

            const newId = response.data?._id;

            navigate(newId ? `/bookings/${newId}` : "/schedule-calendar", { replace: true });
        } catch (requestError) {
            // The validation middleware returns the failing rules in errors[]
            setServerErrors(requestError.data?.errors || []);
            setServerError(
                requestError.data?.errors
                    ? "Please correct the highlighted problems."
                    : requestError.message || "Unable to save this booking"
            );
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return <PageLoader label="Loading booking" />;
    }

    return (
        <div className="booking-page">
            <Link
                className="back-link"
                to={isEdit ? `/bookings/${appointmentId}` : "/schedule-calendar"}
            >
                ‹ {isEdit ? "Back to booking" : "Back to schedule"}
            </Link>

            <header className="booking-header">
                <div>
                    <h1>{isEdit ? "Edit booking" : "New booking"}</h1>

                    <p>
                        {isEdit
                            ? "Guest details are managed on the client record and cannot be changed here."
                            : "An existing guest is reused when the name and contact details match."}
                    </p>
                </div>
            </header>

            {serverError && (
                <div className="schedule-error" role="alert">
                    <p>{serverError}</p>

                    {serverErrors.length > 0 && (
                        <ul className="form-errors">
                            {serverErrors.map((message) => (
                                <li key={message}>{message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <form className="booking-form" onSubmit={handleSubmit} noValidate>
                <section className="booking-panel">
                    <h2>Guest</h2>

                    <div className="booking-form-grid">
                        <label
                            className={`booking-field ${errors.clientFirstName ? "invalid" : ""}`}
                        >
                            <span>First name *</span>

                            <input
                                name="clientFirstName"
                                value={form.clientFirstName}
                                onChange={handleChange}
                                disabled={isEdit || submitting}
                            />

                            {errors.clientFirstName && (
                                <small>{errors.clientFirstName}</small>
                            )}
                        </label>

                        <label className="booking-field">
                            <span>Last name</span>

                            <input
                                name="clientLastName"
                                value={form.clientLastName}
                                onChange={handleChange}
                                disabled={isEdit || submitting}
                            />
                        </label>

                        <label
                            className={`booking-field ${errors.clientPhone ? "invalid" : ""}`}
                        >
                            <span>Phone</span>

                            <input
                                name="clientPhone"
                                value={form.clientPhone}
                                onChange={handleChange}
                                disabled={isEdit || submitting}
                            />

                            {errors.clientPhone && <small>{errors.clientPhone}</small>}
                        </label>

                        <label
                            className={`booking-field ${errors.clientEmail ? "invalid" : ""}`}
                        >
                            <span>Email</span>

                            <input
                                name="clientEmail"
                                type="email"
                                value={form.clientEmail}
                                onChange={handleChange}
                                disabled={isEdit || submitting}
                            />

                            {errors.clientEmail && <small>{errors.clientEmail}</small>}
                        </label>
                    </div>
                </section>

                <section className="booking-panel">
                    <h2>Booking</h2>

                    <div className="booking-form-grid">
                        <label
                            className={`booking-field ${errors.locationId ? "invalid" : ""}`}
                        >
                            <span>Location *</span>

                            <select
                                name="locationId"
                                value={form.locationId}
                                onChange={handleLocationChange}
                                disabled={isEdit || submitting}
                            >
                                <option value="">Select a location</option>

                                {locations.map((location) => (
                                    <option key={location._id} value={location._id}>
                                        {location.name}
                                    </option>
                                ))}
                            </select>

                            {errors.locationId && <small>{errors.locationId}</small>}
                        </label>

                        <label
                            className={`booking-field ${errors.serviceId ? "invalid" : ""}`}
                        >
                            <span>Service *</span>

                            <select
                                name="serviceId"
                                value={form.serviceId}
                                onChange={handleServiceChange}
                                disabled={submitting || services.length === 0}
                            >
                                <option value="">
                                    {form.locationId
                                        ? "Select a service"
                                        : "Choose a location first"}
                                </option>

                                {services.map((service) => (
                                    <option key={service._id} value={service._id}>
                                        {service.name}
                                        {service.defaultDurationMinutes
                                            ? ` (${service.defaultDurationMinutes} min)`
                                            : ""}
                                    </option>
                                ))}
                            </select>

                            {errors.serviceId && <small>{errors.serviceId}</small>}
                        </label>

                        <label className={`booking-field ${errors.date ? "invalid" : ""}`}>
                            <span>Date *</span>

                            <input
                                name="date"
                                type="date"
                                value={form.date}
                                onChange={handleChange}
                                disabled={submitting}
                            />

                            {errors.date && <small>{errors.date}</small>}
                        </label>

                        <label
                            className={`booking-field ${errors.startTime ? "invalid" : ""}`}
                        >
                            <span>Start time *</span>

                            <input
                                name="startTime"
                                type="time"
                                value={form.startTime}
                                onChange={handleChange}
                                disabled={submitting}
                            />

                            {errors.startTime && <small>{errors.startTime}</small>}
                        </label>

                        <label
                            className={`booking-field ${errors.durationMins ? "invalid" : ""}`}
                        >
                            <span>Duration (minutes)</span>

                            <input
                                name="durationMins"
                                type="number"
                                min={5}
                                max={480}
                                value={form.durationMins}
                                onChange={handleChange}
                                disabled={isEdit || submitting}
                            />

                            {errors.durationMins ? (
                                <small>{errors.durationMins}</small>
                            ) : (
                                <small className="hint">
                                    {isEdit
                                        ? "Duration cannot be changed after the booking is created."
                                        : selectedService?.defaultDurationMinutes
                                          ? `Default for this service: ${selectedService.defaultDurationMinutes} min`
                                          : "Between 5 and 480 minutes"}
                                </small>
                            )}
                        </label>

                        <label
                            className={`booking-field ${errors.partySize ? "invalid" : ""}`}
                        >
                            <span>Party size *</span>

                            <input
                                name="partySize"
                                type="number"
                                min={1}
                                value={form.partySize}
                                onChange={handleChange}
                                disabled={submitting}
                            />

                            {errors.partySize && <small>{errors.partySize}</small>}
                        </label>

                        <label className="booking-field">
                            <span>Channel</span>

                            <select
                                name="channel"
                                value={form.channel}
                                onChange={handleChange}
                                disabled={submitting}
                            >
                                {CHANNELS.map((channel) => (
                                    <option key={channel} value={channel}>
                                        {channel}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </section>

                <section className="booking-panel">
                    <h2>Notes</h2>

                    <label
                        className={`booking-field full-width ${errors.note ? "invalid" : ""}`}
                    >
                        <span>Note</span>

                        <textarea
                            name="note"
                            rows={4}
                            maxLength={1000}
                            value={form.note}
                            onChange={handleChange}
                            disabled={submitting}
                        />

                        {errors.note ? (
                            <small>{errors.note}</small>
                        ) : (
                            <small className="hint">
                                {form.note.length} / 1000 characters
                            </small>
                        )}
                    </label>
                </section>

                <div className="booking-form-actions">
                    <Link
                        className="button-secondary"
                        to={isEdit ? `/bookings/${appointmentId}` : "/schedule-calendar"}
                    >
                        Cancel
                    </Link>

                    <button
                        className="button-primary"
                        type="submit"
                        disabled={submitting}
                    >
                        {submitting && <Spinner />}
                        {isEdit ? "Save changes" : "Create booking"}
                    </button>
                </div>
            </form>
        </div>
    );
}
