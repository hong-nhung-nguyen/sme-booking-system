import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import useActiveLocation from "../../../shared/hooks/useActiveLocation";
import { getFloorPlan } from "../api/floorPlan.api";
import "./FloorPlanPage.css";

const STATUSES = [
    { value: "available", label: "Available" },
    { value: "booked", label: "Reserved" },
    { value: "unavailable", label: "Unavailable" }
];

function getStatus(value) {
    return STATUSES.find((status) => status.value === value) || {
        value: "unknown",
        label: "Unknown"
    };
};

function referenceId(value) {
    return value?._id || value;
}

function StatePanel({ title, children, error=false }) {
    return (
        <section className="fp-state">
            <div role={error ? "alert" : "status"} aria-atomic="true">
                <h2>{title}</h2>
            </div>
            {children}
        </section>
    );
}

export default function FloorPlanPage() {
    const { user } = useAuth();

    const {
        locations,
        activeLocation,
        activeLocationId,
        loading,
        error,
        reloadLocations,
    } = useActiveLocation();

    const canManage = ["owner", "manager"].includes(user?.role);

    return (
        <main className="fp-page" aria-labelledby="fp-heading">

            <header className="fp-header">
                <div>
                    <div className="fp-title-row">
                        <h1 id="fp-heading">{activeLocation?.name || "Select a location to view its floor plan."}</h1>

                        <ul className="fp-legend" aria-label="Table status legend">
                            {STATUSES.map((status) => (
                                <li key={status.value}>
                                    <span
                                        className={`fp-swatch fp-swatch-${status.value}`}
                                        aria-hidden="true"
                                    />
                                    {status.label}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </header>

            {loading ? (
                <StatePanel title="Loading locations…" />
            ) : error ? (
                <StatePanel title={error} error>
                    <button
                        className="fp-button"
                        type="button"
                        onClick={reloadLocations}
                    >
                        Retry loading locations
                    </button>
                </StatePanel>
            ) : locations.length === 0 ? (
                <StatePanel title="No accessible locations">
                    <p>Contact your owner or manager to arrange location access.</p>
                </StatePanel>
            ) : !activeLocationId || !activeLocation ? (
                <StatePanel title="Select a location">
                    <p>Choose a location above to view its floor plan.</p>
                </StatePanel>
            ) : (
                <LocationFloorPlan
                    key={`${user?.businessId}:${user?._id}:${activeLocationId}`}
                    locationId={activeLocationId}
                    locationName={activeLocation.name}
                    canManage={canManage}
                />
            )}
        </main>
    );
}

function LocationFloorPlan({ locationId, locationName, canManage }) {
    const [attempt, setAttempt] = useState(0);
    const [request, setRequest] = useState({
        status: "loading",
        floorPlan: null,
        error: "",
    });

    useEffect(() => {
        let ignore = false;

        async function load() {
            try {
                const floorPlan = await getFloorPlan(locationId);

                if (!ignore) {
                    setRequest({
                        status: "success",
                        floorPlan,
                        error: ""
                    });
                }
            } catch (error) {
                if (!ignore) {
                    setRequest({
                        status: "error",
                        floorPlan: null,
                        error: error.message || "Unable to load this floor plan"
                    });
                }
            }
        }

        load();

        // Late responses from a previous location cannot update this page
        return () => {
            ignore = true;
        };
    }, [locationId, attempt]);

    function retry() {
        setRequest({
            status: "loading",
            floorPlan: null,
            error: ""
        });
        setAttempt((current) => current + 1);
    }

    if (request.status === "loading") {
        return <StatePanel title={`Loading floor plan for ${locationName}...`} />;
    }

    if (request.status === "error") {
        return (
            <StatePanel title={request.error} error>
                <button className="fp-button" type="button" onClick={retry}>
                    Retry loading floor plan
                </button>
            </StatePanel>
        );
    }

    if (!request.floorPlan) {
        return (
            <StatePanel title="No floor plan yet">
                <p>This location does not have a saved layout.</p>

                {canManage && (
                    <Link className="fp-button fp-primary" to="/floor-plan/create">
                        Create Layout
                    </Link>
                )}
            </StatePanel>
        );
    }

    return (
        <FloorPlanContent
            floorPlan={request.floorPlan}
            canManage={canManage}
        />
    );
}

function FloorPlanContent({ floorPlan, canManage }) {
    const [selectedAreaId, setSelectedAreaId] = useState("");

    const areas = [...(floorPlan.sections || [])]
        .filter((area) => area.status === "active")
        .sort((a, b) => a.displayOrder - b.displayOrder);

    const selectedArea =
        areas.find((area) => area._id === selectedAreaId) ||
        areas[0] ||
        null;

    function handleTabKeyDown(event, index) {
        const destinations = {
            ArrowRight: (index + 1) % areas.length,
            ArrowLeft: (index - 1 + areas.length) % areas.length,
            Home: 0,
            End: areas.length - 1,
        };

        const nextIndex = destinations[event.key];
        if (nextIndex === undefined) return;

        event.preventDefault();
        setSelectedAreaId(areas[nextIndex]._id);

        event.currentTarget.parentElement
            .querySelectorAll('[role="tab"]')[nextIndex]
            .focus();
    }

    return (
        <section className="fp-workspace" aria-label="Floor plan">
            <div className="fp-toolbar">
                {areas.length > 0 && (
                    <div
                        className="fp-tabs"
                        role="tablist"
                        aria-label="Floor-plan areas"
                    >
                        {areas.map((area, index) => (
                            <button
                                key={area._id}
                                id={`fp-tab-${area._id}`}
                                className="fp-tab"
                                type="button"
                                role="tab"
                                aria-selected={selectedArea._id === area._id}
                                aria-controls="fp-area-panel"
                                tabIndex={selectedArea._id === area._id ? 0 : -1}
                                onClick={() => setSelectedAreaId(area._id)}
                                onKeyDown={(event) =>
                                    handleTabKeyDown(event, index)
                                }
                            >
                                {area.name}
                            </button>
                        ))}
                    </div>
                )}

                {canManage && (
                    <Link className="fp-button" to="/floor-plan/edit">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            aria-hidden="true"
                        >
                            <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" />
                        </svg>
                        Edit Layout
                    </Link>
                )}
            </div>

            {selectedArea ? (
                <section
                    id="fp-area-panel"
                    role="tabpanel"
                    aria-labelledby={`fp-tab-${selectedArea._id}`}
                    tabIndex={0}
                >
                    <FloorPlanCanvas
                        key={selectedArea._id}
                        floorPlan={floorPlan}
                        area={selectedArea}
                    />
                </section>
            ) : (
                <StatePanel title="No active areas">
                    <p>This floor plan does not have any active areas yet.</p>
                </StatePanel>
            )}
        </section>
    );
}

function FloorPlanCanvas({ floorPlan, area }) {
    const [selectedTableId, setSelectedTableId] = useState(null);
    const [zoom, setZoom] = useState(1);
    const tableButtons = useRef(new Map());

    const tables = (floorPlan.tableLayouts || [])
        .filter(
            (table) =>
                referenceId(table.sectionId) === area._id &&
                table.status === "active"
        )
        .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    const objects = (floorPlan.objects || []).filter(
        (object) => referenceId(object.sectionId) === area._id
    );

    const selectedTable = tables.find(
        (table) => table._id === selectedTableId
    );

    const resource = selectedTable?.resourceId;
    const selectedStatus = getStatus(resource?.status);

    const canvasWidth = floorPlan.canvas?.width || 1200;
    const canvasHeight = floorPlan.canvas?.height || 800;

    // Scale saved coordinates into a readable preview. Overflow stays
    // inside the canvas on small screens and at higher zoom levels.
    const scale = (640 / canvasWidth) * zoom;

    function placement(item) {
        return {
            left: item.x * scale,
            top: item.y * scale,
            width: item.width * scale,
            height: item.height * scale,
            transform: `rotate(${item.rotation || 0}deg)`,
        };
    }

    function closeDetails() {
        const previousId = selectedTableId;
        setSelectedTableId(null);
        tableButtons.current.get(previousId)?.focus();
    }

    return (
        <div className="fp-board">
            <section className="fp-canvas-card" aria-label={`${area.name} layout`}>
                <div className="fp-canvas-wrapper">
                    <div className="fp-zoom" role="group" aria-label="Canvas zoom">
                        <button
                            type="button"
                            aria-label="Zoom in"
                            disabled={zoom >= 2}
                            onClick={() =>
                                setZoom((value) => Math.min(2, value + 0.25))
                            }
                        >
                            +
                        </button>
                        <button
                            type="button"
                            aria-label="Reset zoom"
                            onClick={() => setZoom(1)}
                        >
                            {Math.round(zoom * 100)}%
                        </button>
                        <button
                            type="button"
                            aria-label="Zoom out"
                            disabled={zoom <= 0.75}
                            onClick={() =>
                                setZoom((value) => Math.max(0.75, value - 0.25))
                            }
                        >
                            −
                        </button>
                    </div>

                    <div
                        className="fp-canvas-scroll"
                        tabIndex={0}
                        role="region"
                        aria-label="Floor-plan canvas. Scroll to view all tables."
                    >
                        <div
                            className="fp-canvas"
                            style={{
                                width: canvasWidth * scale,
                                height: canvasHeight * scale,
                            }}
                        >
                            {objects.map((object) => (
                                <div
                                    key={object._id}
                                    className={`fp-object fp-object-${object.type}`}
                                    style={placement(object)}
                                >
                                    {object.label ||
                                        (object.type === "kitchenBar"
                                            ? "Kitchen Bar"
                                            : "")}
                                </div>
                            ))}

                            {tables.map((table) => {
                                const tableResource = table.resourceId;
                                const status = getStatus(tableResource?.status);
                                const selected = selectedTableId === table._id;

                                return (
                                    <button
                                        key={table._id}
                                        ref={(node) => {
                                            if (node) {
                                                tableButtons.current.set(table._id, node);
                                            } else {
                                                tableButtons.current.delete(table._id);
                                            }
                                        }}
                                        type="button"
                                        className={[
                                            "fp-table",
                                            `fp-table-${status.value}`,
                                            table.shape === "circle" ? "fp-table-round" : "",
                                        ].filter(Boolean).join(" ")}
                                        style={placement(table)}
                                        aria-label={`Table ${tableResource?.number || "unnamed"}, ${status.label}, capacity ${tableResource?.maxCapacity ?? "unknown"}`}
                                        aria-pressed={selected}
                                        aria-controls="fp-table-details"
                                        onClick={() => setSelectedTableId(table._id)}
                                    >
                                        <strong>{tableResource?.number || "Table"}</strong>
                                        <span>{tableResource?.maxCapacity ?? "—"} seats</span>
                                    </button>
                                );
                            })}

                            {tables.length === 0 && (
                                <p className="fp-canvas-empty" role="status">
                                    No tables have been placed in this area.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <aside
                id="fp-table-details"
                className="fp-details"
                aria-label="Table details"
                onKeyDown={(event) => {
                    if (event.key === "Escape" && selectedTable) {
                        event.preventDefault();
                        closeDetails();
                    }
                }}
            >
                {selectedTable ? (
                    <>
                        <header className="fp-details-header">
                            <div aria-live="polite" aria-atomic="true">
                                <div className="fp-details-title">
                                    <h2>Table {resource?.number || "unnamed"}</h2>
                                    <span className={`fp-badge fp-badge-${selectedStatus.value}`}>
                                        {selectedStatus.label}
                                    </span>
                                </div>
                                <p>
                                    {area.name} · Seating: {resource?.maxCapacity ?? "Unknown"}
                                </p>
                            </div>

                            <button
                                className="fp-close"
                                type="button"
                                aria-label="Close table details"
                                onClick={closeDetails}
                            >
                                ×
                            </button>
                        </header>

                        <div className="fp-details-body">
                            <section className="fp-detail-section">
                                <h3>Current party</h3>
                                <p>Guest details are not available in this view.</p>
                            </section>

                            <section className="fp-detail-section">
                                <h3>Table status</h3>
                                <div className="fp-info-card">
                                    <strong>{selectedStatus.label}</strong>
                                    <p>Capacity: {resource?.maxCapacity ?? "Unknown"} guests</p>
                                </div>
                            </section>

                            <section className="fp-detail-section">
                                <h3>Next reservation</h3>
                                <p>Upcoming reservations are not available in this view.</p>
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="fp-details-empty" role="status">
                        <div className="fp-empty-symbol" aria-hidden="true">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <rect x="5" y="5" width="14" height="14" rx="2" />
                                <path d="M9 2v3m6-3v3M9 19v3m6-3v3M2 9h3m-3 6h3m14-6h3m-3 6h3" />
                            </svg>
                        </div>
                        <h2>Select a table</h2>
                        <p>Choose a table on the floor plan to view its details.</p>
                    </div>
                )}
            </aside>
        </div>
    );
}