import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import useActiveLocation from "../../../shared/hooks/useActiveLocation";
import LocationSelector from "../../../shared/ui/LocationSelector/LocationSelector";
import { getFloorPlan } from "../api/floorPlan.api";
import "./FloorPlanPage.css";

const STATUSES = [
    { value: "available", label: "Available" },
    { value: "booked", label: "Booked" },
    { value: "unavailable", label: "Unavailable" }
];

function StatePanel({ title, children, error=false }) {
    return (
        <section className="fp-state">
            <div role={error ? "alert" : "status"} aria-atomic="true">
                <h2>{title}</h2>
            </div>
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
            <nav aria-label="Breadcrumb">
                <ol className="fp-breadcrumb">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li aria-current="page">Floor Plan</li>
                </ol>
            </nav>

            <header className="fp-header">
                <div>
                    <div className="fp-title-row">
                        <h1 id="fp-heading">Floor Plan</h1>
                        <span className="fp-live">
                            <span aria-hidden="true" />
                            Live View
                        </span>
                    </div>

                    <p>{activeLocation?.name || "Select a location to view its floor plan."}</p>
                </div>

                <LocationSelector allowOverview={false} />
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
    const [selectedAreadId, setSelectedAreadId] = useState("");

    const areas = [...(floorPlan.sections || [])]
        .filter((area) => area.status === "active")
        .sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Handle a selected area disappearing from refreshed data
    const selectedArea = areas.find((area) => area.id === selectedAreadId) || areas[0] || null;

    function handleTabKeyDown(event, index) {
        let nextIndex;

        switch (event.key) {
            case "ArrowRight":
                nextIndex = (index + 1) % areas.length;
                break;
            case "ArrowLeft":
                nextIndex = (index - 1 + areas.length) % areas.length;
                break;
            case "Home":
                nextIndex = 0;
                break;
            case "End":
                nextIndex = areas.length - 1;
                break;
            default:
                return;
        }

        event.preventDefault();
        setSelectedAreadId(areas[nextIndex]._id);

        event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[nextIndex].focus();
    }

    return (
        <section className="fp-card" aria-label="Floor plan">
            <div className="fp-toolbar">
                <h2>Areas</h2>

                {canManage && (
                    <Link className="fp-button fp-primary" to="/floor-plan/edit">
                        Edit Layout
                    </Link>
                )}
            </div>

            {selectedArea ? (
                <>
                    <div className="fp-tabs" role="tablist" aria-label="Floor-plan areas">
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
                                onKeyDown={(event) => handleTabKeyDown(event, index)}
                            >
                                {area.name}
                            </button>
                        ))}
                    </div>

                    <section
                        id="fp-area-panel"
                        role="tabpanel"
                        aria-labelledby={`fp-tab-${selectedArea._id}`}
                        tabIndex={0}
                    >
                        <div
                            key={selectedArea._id}
                            className="fp-canvas"
                            aria-label={`${selectedArea.name} floor-plan canvas`}
                        >
                            <div className="fp-canvas-caption">
                                <h3>{selectedArea.name}</h3>
                                <p>
                                    {(floorPlan.tableLayouts || []).filter(
                                        (table) =>
                                            table.sectionId === selectedArea._id &&
                                            table.status === "active"
                                    ).length} saved table placements
                                </p>
                            </div>

                            {/* Mount the read-only table/object renderer here.
                                Keep table-selection state inside this keyed
                                area subtree so it resets with the area/location. */}
                        </div>
                    </section>
                </>
            ) : (
                <StatePanel title="No active areas">
                    <p>
                        {canManage
                            ? "Use Edit Layout to configure this floor plan."
                            : "This floor plan does not have any active areas."}
                    </p>
                </StatePanel>
            )}

            <footer className="fp-footer">
                <ul className="fp-legend" aria-label="Table status legend">
                    {STATUSES.map((status) => (
                        <li key={status.value}>
                            <span
                                className={`fp-dot fp-dot-${status.value}`}
                                aria-hidden="true"
                            />
                            {status.label}
                        </li>
                    ))}
                </ul>

                <p>Layout data is loaded when you select a location.</p>
            </footer>
        </section>
    );
}