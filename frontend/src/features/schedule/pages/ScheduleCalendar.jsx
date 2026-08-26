import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppointments } from "../api/appointment.api";
import { getServices } from "../../../shared/api/location.api";
import useLocations from "../../../shared/hooks/useLocations";
import {
    useAppLayout,
    useSidebarSlot,
} from "../../../shared/ui/AppLayout/layoutContext";
import NavSider from "../../../shared/ui/NavSider/NavSider";
import BookingCard from "../components/BookingCard";
import MetricCard from "../components/MetricCard";
import ScheduleBookingSidebar from "../components/ScheduleBookingSidebar";
import {
    APPOINTMENT_STATUSES,
    INACTIVE_STATUSES,
} from "../../../shared/constants/appointmentStatus";
import { getId } from "../../../shared/lib/appointment";
import { shiftDate } from "../../../shared/lib/datetime";
import {
    END_HOUR,
    formatDate,
    formatTime,
    getGuestName,
    getPosition,
    getResourceName,
    getWidth,
    START_HOUR,
    toDateInputValue,
} from "../schedule.utils";
import "./ScheduleCalendar.css";

export default function ScheduleCalendar() {
    const navigate = useNavigate();
    const { sidebarCollapsed, toggleSidebar } = useAppLayout();

    const {
        locations,
        selectedLocationId,
        selectLocation,
        error: locationError,
    } = useLocations();

    const [selectedDate, setSelectedDate] = useState(
        toDateInputValue(new Date())
    );

    const [statusFilter, setStatusFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [search, setSearch] = useState("");

    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [showNavigation, setShowNavigation] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [now, setNow] = useState(new Date());

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getAppointments({
                date: selectedDate,
                status: statusFilter,
                serviceId: serviceFilter,
            });

            setAppointments(response.appointments || []);
        } catch (requestError) {
            setError(requestError.message || "Unable to load appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate, statusFilter, serviceFilter]);

    useEffect(() => {
        loadAppointments();
    }, [loadAppointments]);

    // Services are defined per location, so reload them when the location changes
    useEffect(() => {
        if (!selectedLocationId) {
            setServices([]);
            return;
        }

        let cancelled = false;

        getServices(selectedLocationId)
            .then((response) => {
                if (!cancelled) setServices(response.services || []);
            })
            .catch(() => {
                if (!cancelled) setServices([]);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedLocationId]);

    // A service chosen at one location may not exist at the next one
    useEffect(() => {
        if (
            serviceFilter &&
            services.length > 0 &&
            !services.some((service) => service._id === serviceFilter)
        ) {
            setServiceFilter("");
        }
    }, [services, serviceFilter]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 60000); // update the current time every 1 minute

        return () => window.clearInterval(timer);
    }, []);

    const openBooking = useCallback(
        (appointment) => navigate(`/bookings/${appointment._id}`),
        [navigate]
    );

    const createBooking = useCallback(() => {
        const params = new URLSearchParams({ date: selectedDate });

        if (selectedLocationId) params.set("locationId", selectedLocationId);

        navigate(`/bookings/new?${params.toString()}`);
    }, [navigate, selectedDate, selectedLocationId]);

    /**
     * The appointments endpoint cannot filter by location or guest name,
     * so those two narrow the already-loaded day here.
     */
    const visibleAppointments = useMemo(() => {
        const term = search.trim().toLowerCase();

        return appointments.filter((appointment) => {
            if (
                selectedLocationId &&
                getId(appointment.locationId) !== selectedLocationId
            ) {
                return false;
            }

            if (!term) return true;

            return (
                getGuestName(appointment).toLowerCase().includes(term) ||
                getResourceName(appointment).toLowerCase().includes(term)
            );
        });
    }, [appointments, search, selectedLocationId]);

    /*
     * The sidebar toggles between navigation and the day's bookings. The page
     * owns that state because it owns the appointments; AppLayout just renders
     * whatever it is handed.
     */
    const sidebar = useMemo(
        () =>
            showNavigation ? (
                <NavSider
                    collapsed={sidebarCollapsed}
                    onNewReservation={createBooking}
                    onToggleCollapse={toggleSidebar}
                />
            ) : (
                <ScheduleBookingSidebar
                    appointments={visibleAppointments}
                    loading={loading}
                    onOpen={openBooking}
                    onShowNavigation={() => setShowNavigation(true)}
                />
            ),
        [
            showNavigation,
            visibleAppointments,
            loading,
            openBooking,
            createBooking,
            sidebarCollapsed,
            toggleSidebar,
        ]
    );

    useSidebarSlot(sidebar);

    const appointmentsByResource = useMemo(() => {
        const groups = new Map();

        visibleAppointments.forEach((appointment) => {
            const resourceName = getResourceName(appointment);

            if (!groups.has(resourceName)) {
                groups.set(resourceName, []);
            }

            groups.get(resourceName).push(appointment);
        });

        // sort alphabetically
        return Array.from(groups.entries()).sort(([first], [second]) =>
            first.localeCompare(second)
        );
    }, [visibleAppointments]);

    const totals = useMemo(() => {
        const active = visibleAppointments.filter(
            (appointment) => !INACTIVE_STATUSES.includes(appointment.status)
        );

        return {
            bookings: active.length,

            covers: active.reduce((total, appointment) => {
                return total + (appointment.partySize || 0);
            }, 0),

            seated: visibleAppointments.filter(
                (appointment) => appointment.status === "seated"
            ).length,

            walkIns: visibleAppointments.filter(
                (appointment) => appointment.status === "walkIn"
            ).length,
        };
    }, [visibleAppointments]);

    // Create an array of n length and run callback for each element
    const timeLineLabels = Array.from(
        { length: (END_HOUR - START_HOUR) * 2 + 1 },
        (_, index) => {
            const totalMinutes = START_HOUR * 60 + index * 30;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;

            return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
        }
    );

    const today = toDateInputValue(now);
    const showCurrentTime = selectedDate === today;
    const currentTimePosition = getPosition(now);

    return (
        <div className="schedule-page">
            <section className="overview">
                <div className="overview-heading">
                    <h1>Daily Overview</h1>

                    <p>
                        {formatDate(selectedDate)} — managing{" "}
                        {visibleAppointments.length} bookings across{" "}
                        {appointmentsByResource.length} resources
                    </p>
                </div>

                <div className="metrics">
                    <MetricCard
                        label="Bookings"
                        value={totals.bookings}
                        className="blue"
                    />

                    <MetricCard label="Covers" value={totals.covers} />

                    <MetricCard
                        label="Seated"
                        value={totals.seated}
                        className="green"
                    />

                    <MetricCard label="Walk-ins" value={totals.walkIns} />
                </div>
            </section>

            <section className="filters">
                <div className="date-control">
                    <button
                        type="button"
                        onClick={() => setSelectedDate(shiftDate(selectedDate, -1))}
                        aria-label="Previous day"
                    >
                        ‹
                    </button>

                    <input
                        type="date"
                        value={selectedDate}
                        aria-label="Schedule date"
                        onChange={(event) => setSelectedDate(event.target.value)}
                    />

                    <button
                        type="button"
                        onClick={() => setSelectedDate(shiftDate(selectedDate, 1))}
                        aria-label="Next day"
                    >
                        ›
                    </button>
                </div>

                <button
                    className="today-button"
                    type="button"
                    onClick={() => setSelectedDate(today)}
                >
                    Today
                </button>

                <select
                    aria-label="Location"
                    value={selectedLocationId}
                    onChange={(event) => selectLocation(event.target.value)}
                >
                    {locations.length === 0 && <option value="">No locations</option>}

                    {locations.map((location) => (
                        <option key={location._id} value={location._id}>
                            {location.name}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Service filter"
                    value={serviceFilter}
                    onChange={(event) => setServiceFilter(event.target.value)}
                >
                    <option value="">All services</option>

                    {services.map((service) => (
                        <option key={service._id} value={service._id}>
                            {service.name}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Status filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                >
                    <option value="">All statuses</option>

                    {APPOINTMENT_STATUSES.map(({ value, label }) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <label className="search-box">
                    <span aria-hidden="true">⌕</span>

                    <input
                        type="search"
                        value={search}
                        placeholder="Search guests or resources..."
                        aria-label="Search guests or resources"
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </label>
            </section>

            {(error || locationError) && (
                <div className="schedule-error" role="alert">
                    {error || locationError}
                </div>
            )}

            <section className="calendar" aria-label="Live booking schedule">
                <header className="calendar-header">
                    <strong>RESOURCE</strong>

                    <div className="timeline-labels">
                        {timeLineLabels.map((label) => (
                            <span key={label}>{label}</span>
                        ))}
                    </div>
                </header>

                <div className="calendar-content">
                    {loading && (
                        <div className="empty-calendar">Loading bookings...</div>
                    )}

                    {!loading && appointmentsByResource.length === 0 && (
                        <div className="empty-calendar">
                            No bookings to display for {formatDate(selectedDate)}
                        </div>
                    )}

                    {!loading &&
                        appointmentsByResource.map(([resourceName, bookings]) => (
                            <div className="calendar-row" key={resourceName}>
                                <div className="resource-cell">
                                    <strong>{resourceName}</strong>

                                    <span>
                                        {Math.max(
                                            ...bookings.map(
                                                (booking) => booking.partySize || 0
                                            ),
                                            0
                                        )}{" "}
                                        covers
                                    </span>
                                </div>

                                <div className="timeline-track">
                                    {bookings.map((appointment) => (
                                        <div
                                            className="timeline-booking"
                                            key={appointment._id}
                                            style={{
                                                left: `${getPosition(appointment.startTime)}%`,
                                                width: `${getWidth(appointment)}%`,
                                            }}
                                        >
                                            <BookingCard
                                                appointment={appointment}
                                                onOpen={openBooking}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                    {showCurrentTime &&
                        currentTimePosition >= 0 &&
                        currentTimePosition <= 100 && (
                            <div
                                className="current-time"
                                style={{
                                    left: `calc(116px + (100% - 116px) * ${currentTimePosition / 100})`,
                                }}
                            >
                                <span>{formatTime(now)}</span>
                            </div>
                        )}
                </div>
            </section>

            <div className="floating-actions">
                <button
                    type="button"
                    aria-label="Refresh bookings"
                    onClick={loadAppointments}
                >
                    ↻
                </button>

                <button
                    className="add-button"
                    type="button"
                    aria-label="New booking"
                    onClick={createBooking}
                >
                    ＋
                </button>
            </div>
        </div>
    );
}
