import { useEffect, useMemo, useState } from "react";

const STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "temporarilyUnavailable", label: "Temporarily Unavailable" },
    { value: "discontinued", label: "Discontinued" }
];

const EMPTY_FORM = {
    name: "",
    description: "",
    defaultDurationMinutes: 90,
    globalStatus: "active",
    localStatus: "active"
};

function serviceToForm(service) {
    if (!service) return EMPTY_FORM;

    return {
        name: service.name || "",
        description: service.description || "",
        defaultDurationMinutes: String(service.defaultDurationMinutes) || "",
        globalStatus: service.globalStatus || "active",
        localStatus: service.localStatus || "active"
    };
};

function validateServiceForm(form) {
    const errors = {};

    if (!form.name.trim()) {
        errors.name = "Service name is required";
    }

    const duration = Number(form.defaultDurationMinutes);

    if (!duration) {
        errors.defaultDurationMinutes = "Default duration is required";
    } else if (duration < 5 || duration > 1000 || duration % 5 !== 0) {
        errors.defaultDurationMinutes = "Duration must be between 5 and 1000 minutes in 5-minute intervals";
    } 

    return errors;
};

export default function LocationServiceForm({
    mode = "create",
    service = null,
    businessServices = [],
    assignedServiceIds = [],
    loadingBusinessServices = false,
    serverErrors = {},
    submitting = false,
    onSubmit,
    onCancel
}) {
    const [form, setForm] = useState(() => serviceToForm(service));
    const [errors, setErrors] = useState({});
    const [dirty, setDirty] = useState(false);
    const [createMode, setCreateMode] = useState("new");
    const [selectedExistingServiceIds, setSelectedExistingServiceIds] = useState([]);

    const isEdit = mode === "edit";
    const assignedServiceIdSet = useMemo(
        () => new Set(assignedServiceIds),
        [assignedServiceIds]
    );

    const changedCanonicalFields = useMemo(() => {
        if (!service) return false;

        return (
            form.name !== (service.name || "") ||
            form.description !== (service.description || "") ||
            Number(form.defaultDurationMinutes) !== Number(service.defaultDurationMinutes || 0) ||
            form.globalStatus !== (service.globalStatus || "active")
        );
    }, [form, service]);

    useEffect(() => {
        function handleBeforeUnload(event) {
            if (!dirty) return;

            event.preventDefault();
            event.returnValue = "";
        }

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [dirty]);

    function updateField(field, value) {
        setForm((current) => ({
            ...current,
            [field]: value
        }));

        setDirty(true);

        setErrors((current) => ({
            ...current,
            [field]: ""
        }));
    };

    function updateCreateMode(nextMode) {
        setCreateMode(nextMode);
        setDirty(true);
        setErrors((current) => ({
            ...current,
            existingServices: ""
        }));
    }

    function toggleExistingService(serviceId) {
        setDirty(true);
        setErrors((current) => ({
            ...current,
            existingServices: ""
        }));

        setSelectedExistingServiceIds((current) => {
            if (current.includes(serviceId)) {
                return current.filter((id) => id !== serviceId);
            }

            return [...current, serviceId];
        });
    }

    function handleCancel() {
        if (dirty && !window.confirm("Discard unsaved changes?")) {
            return;
        }

        onCancel();
    };

    async function handleSubmit(event) {
        event.preventDefault();

        if (!isEdit && createMode === "existing") {
            if (selectedExistingServiceIds.length === 0) {
                setErrors({
                    existingServices: "Choose at least one service to assign."
                });
                return;
            }

            await onSubmit({
                action: "assignExisting",
                serviceIds: selectedExistingServiceIds
            });

            setDirty(false);
            return;
        }

        const nextErrors = validateServiceForm(form);
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            return;
        }

        await onSubmit({
            action: isEdit ? "edit" : "createNew",
            canonical: {
                name: form.name.trim(),
                description: form.description.trim(),
                defaultDurationMinutes: Number(form.defaultDurationMinutes),
                status: form.globalStatus
            },
            local: {
                status: form.localStatus
            },
            unsupportedPriceFields: {
                basePrice: form.basePrice ? Number(form.basePrice) : null,
                localPriceOverride: form.localPriceOverride ? Number(form.localPriceOverride) : null
            }
        });

        setDirty(false);
    };

    function fieldError(name) {
        return errors[name] || serverErrors[name] || "";
    };

    return (
        <form className="service-form" onSubmit={handleSubmit}>
            <header className="service-form-header">
                <div>
                    <h2>{isEdit ? "Edit service" : "Add service"}</h2>
                    <p>
                        {isEdit
                            ? "Canonical changes affect every location using this service."
                            : "Create a new service or assign existing business-wide services to this location."}
                    </p>
                </div>
            </header>

            {!isEdit && (
                <div className="service-form-mode" role="group" aria-label="Add service method">
                    <button
                        type="button"
                        className={createMode === "new" ? "active" : ""}
                        onClick={() => updateCreateMode("new")}
                    >
                        Create new
                    </button>
                    <button
                        type="button"
                        className={createMode === "existing" ? "active" : ""}
                        onClick={() => updateCreateMode("existing")}
                    >
                        Use existing
                    </button>
                </div>
            )}

            {isEdit && changedCanonicalFields && (
                <div className="service-form-warning" role="status">
                    These canonical edits affect other locations that use this service.
                </div>
            )}

            {!isEdit && createMode === "existing" ? (
                <fieldset className="service-form-section">
                    <legend>Business-wide services</legend>

                    {loadingBusinessServices ? (
                        <p className="service-form-muted">Loading services...</p>
                    ) : businessServices.length === 0 ? (
                        <p className="service-form-muted">No business-wide services are available yet.</p>
                    ) : (
                        <div className="existing-service-list">
                            {businessServices.map((businessService) => {
                                const serviceId = businessService._id || businessService.serviceId;
                                const alreadyAssigned = assignedServiceIdSet.has(serviceId);

                                return (
                                    <label
                                        className={`existing-service-option ${alreadyAssigned ? "disabled" : ""}`}
                                        key={serviceId}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedExistingServiceIds.includes(serviceId)}
                                            disabled={alreadyAssigned || submitting}
                                            onChange={() => toggleExistingService(serviceId)}
                                        />
                                        <span>
                                            <strong>{businessService.name}</strong>
                                            <small>
                                                {alreadyAssigned
                                                    ? "Already assigned to this location"
                                                    : `${businessService.defaultDurationMinutes || "-"} min · ${businessService.status || "active"}`}
                                            </small>
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    )}

                    {fieldError("existingServices") && <small>{fieldError("existingServices")}</small>}
                </fieldset>
            ) : (
                <>
                    <fieldset className="service-form-section">
                <legend>Canonical service</legend>

                <label>
                    <span>Service name</span>
                    <input
                        value={form.name}
                        onChange={(event) => updateField("name", event.target.value)}
                        aria-invalid={Boolean(fieldError("name"))}
                    />
                    {fieldError("name") && <small>{fieldError("name")}</small>}
                </label>

                <label>
                    <span>Description</span>
                    <textarea
                        value={form.description}
                        onChange={(event) => updateField("description", event.target.value)}
                        rows={4}
                        aria-invalid={Boolean(fieldError("description"))}
                    />
                    {fieldError("description") && <small>{fieldError("description")}</small>}
                </label>

                <label>
                    <span>Default duration</span>
                    <input
                        type="number"
                        min="5"
                        max="1000"
                        step="5"
                        value={form.defaultDurationMinutes}
                        onChange={(event) => updateField("defaultDurationMinutes", event.target.value)}
                        aria-invalid={Boolean(fieldError("defaultDurationMinutes"))}
                    />
                    {fieldError("defaultDurationMinutes") && <small>{fieldError("defaultDurationMinutes")}</small>}
                </label>

                <label>
                    <span>Global status</span>
                    <select
                        value={form.globalStatus}
                        onChange={(event) => updateField("globalStatus", event.target.value)}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </fieldset>

            <fieldset className="service-form-section local-section">
                <legend>Current location assignment</legend>

                <label>
                    <span>Local status</span>
                    <select
                        value={form.localStatus}
                        onChange={(event) => updateField("localStatus", event.target.value)}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </fieldset>
                </>
            )}

            <footer className="service-form-actions">
                <button type="button" onClick={handleCancel} disabled={submitting}>
                    Cancel
                </button>
                <button className="primary-action" type="submit" disabled={submitting}>
                    {submitting
                        ? "Saving..."
                        : !isEdit && createMode === "existing"
                            ? "Assign selected"
                            : "Save service"}
                </button>
            </footer>
        </form>
    );
}

