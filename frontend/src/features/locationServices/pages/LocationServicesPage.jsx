import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import useAuth from "../../auth/hooks/useAuth";
import useActiveLocation from "../../../shared/hooks/useActiveLocation";
import {
    getLocationServices,
    unassignLocationService,
    updateLocationServiceStatus
} from "../api/locationService.api";
import "./LocationServicesPage.css";

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "temporarilyUnavailable", label: "Temporarily unavailable" },
    { value: "discontinued", label: "Discontinued" }
];

const STATUS_LABELS = {
    active: "Active",
    temporarilyUnavailable: "Temporarily unavailable",
    discontinued: "Discontinued"
};

function getServiceId(item) {
    return item?.serviceId?._id || item?.serviceId || item?._id || "";
};

function getServiceName(item) {
    return item?.serviceId?.name || item?.name || "Unnamed service";
};

function getServiceDuration(item) {
    return item?.serviceId?.defaultDurationMinutes || item?.defaultDurationMinutes || null;
};

function getAttachmentCount(item) {
    return item?.attachmentCount || item?.serviceId?.attachments?.length || item?.attachments?.length || 0;
};

export default function LocationServicesPage() {
    const { user } = useAuth();
    const {
        activeLocation,
        activeLocationId,
        loading: locationLoading,
        error: locationError
    } = useActiveLocation();

    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [mutatingId, setMutatingId] = useState("");

    const deferredSearch = useDeferredValue(search);

    const canManageServices = ["owner", "manager"].includes(user?.role);

    const loadServices = useCallback(async () => {
        if (!activeLocationId) {
            setServices([]);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await getLocationServices(activeLocationId);
            setServices(response.location?.services || response.services || []);
        } catch (requestError) {
            setError(requestError.message || "Unable to load services for this location");
        } finally {
            setLoading(false);
        }
    }, [activeLocationId]);

    useEffect(() => {
        loadServices();
    }, [loadServices]);

    const filteredServices = useMemo(() => {
        const query = deferredSearch.trim().toLocaleLowerCase();

        return services.filter((item) => {
            const name = getServiceName(item).toLocaleLowerCase();
            const status = item.status || item.serviceId?.status || "active";

            const matchesSearch = !query || name.includes(query);
            const matchesStatus = statusFilter === "all" || status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [services, deferredSearch, statusFilter]);

    async function handleStatusChange(serviceId, status) {
        setMutatingId(serviceId);

        try {
            await updateLocationServiceStatus(activeLocationId, serviceId, status);
            await loadServices();
        } catch (requestError) {
            setError(requestError.message || "Unable to update service status.");
        } finally {
            setMutatingId("");
        }
    };

    async function handleArchive(serviceId) {
        setMutatingId(serviceId);

        try {
            await unassignLocationService(activeLocationId, serviceId);
            await loadServices();
        } catch (requestError) {
            setError(requestError.message || "Unable to archive service from this location.");
        } finally {
            setMutatingId("");
        }
    };

    if (locationLoading) {
        return <main className="location-services-page">Loading location...</main>;
    }

    if (locationError) {
        return (
            <main className="location-services-page">
                <section className="service-state-panel">
                    <h1>Service Management</h1>
                    <p>{locationError}</p>
                </section>
            </main>
        );
    }

    if (!activeLocationId) {
        return (
            <main className="location-services-page">
                <section className="service-state-panel">
                    <h1>Service Management</h1>
                    <p>Select a location to manage its services.</p>
                </section>
            </main>
        );
    }

    return (
        <main className="location-services-page">
            <header className="service-page-header">
                <div>
                    <p>Service Management</p>
                    <h1 className="service-page-kicker">{activeLocation?.name || "Current location"}</h1>
                </div>

                {canManageServices && (
                    <button className="primary-action" type="button">
                        Add Service
                    </button>
                )}
            </header>

            <section className="service-toolbar" aria-label="Service filters">
                <label className="service-field">
                    <span>Search</span>
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search services"
                    />
                </label>

                <label className="service-field">
                    <span>Status</span>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            {error && (
                <section className="service-error" role="alert">
                    <p>{error}</p>
                    <button type="button" onClick={loadServices}>
                        Retry
                    </button>
                </section>
            )}

            {loading ? (
                <section className="service-list" aria-label="Loading services">
                    {[1, 2, 3].map((item) => (
                        <div className="service-skeleton" key={item} />
                    ))}
                </section>
            ) : filteredServices.length === 0 ? (
                <section className="service-empty">
                    <h2>No services found</h2>
                    <p>
                        {services.length === 0
                            ? "This location does not have any assigned services yet."
                            : "No services match the current filters."}
                    </p>

                    {canManageServices && (
                        <button className="primary-action" type="button">
                            Add Service
                        </button>
                    )}
                </section>
            ) : (
                <section className="service-list" aria-label="Location services">
                    {filteredServices.map((item) => {
                        const serviceId = getServiceId(item);
                        const status = item.status || item.serviceId?.status || "active";
                        const duration = getServiceDuration(item);
                        const attachmentCount = getAttachmentCount(item);
                        const isMutating = mutatingId === serviceId;

                        return (
                            <article className="service-card" key={serviceId}>
                                <div className="service-card-main">
                                    <div>
                                        <h2>{getServiceName(item)}</h2>
                                        <p>
                                            {duration ? `${duration} min` : "No duration set"}
                                        </p>
                                    </div>

                                    <span className={`service-status ${status}`}>
                                        {STATUS_LABELS[status] || status}
                                    </span>
                                </div>

                                <dl className="service-meta">
                                    <div>
                                        <dt>Duration</dt>
                                        <dd>{duration ? `${duration} min` : "-"}</dd>
                                    </div>
                                    <div>
                                        <dt>Attachments</dt>
                                        <dd>{attachmentCount}</dd>
                                    </div>
                                    <div>
                                        <dt>Global status</dt>
                                        <dd>{STATUS_LABELS[item.globalStatus] || STATUS_LABELS[item.serviceId?.status] || item.globalStatus || item.serviceId?.status || "Active"}</dd>
                                    </div>
                                </dl>

                                {canManageServices && (
                                    <div className="service-actions">
                                        <button type="button" disabled={isMutating}>
                                            Edit
                                        </button>
                                        <button type="button" disabled={isMutating}>
                                            Attachments
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isMutating}
                                            onClick={() =>
                                                handleStatusChange(
                                                    serviceId,
                                                    status === "active" ? "temporarilyUnavailable" : "active"
                                                )
                                            }
                                        >
                                            {status === "active" ? "Deactivate" : "Activate"}
                                        </button>
                                        <button
                                            className="danger-action"
                                            type="button"
                                            disabled={isMutating}
                                            onClick={() => handleArchive(serviceId)}
                                        >
                                            Archive
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}
        </main>
    );
}
