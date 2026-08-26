import useAuth from "../../../features/auth/hooks/useAuth";
import useActiveLocation from "../../hooks/useActiveLocation";
import "./LocationSelector.css";

export default function LocationSelector() {
    const { user } = useAuth();

    const {
        locations,
        activeLocation,
        activeLocationId,
        selectLocation,
        clearActiveLocation,
        loading,
        error
    } = useActiveLocation();

    if (loading) {
        return (
            <div className="location-context" aria-live="polite">
                Loading location…
            </div>
        );
    }

    if (error) {
        return (
            <div className="location-context location-context-error">
                Location unavailable
            </div>
        );
    }

    // Staff/manager: show assigned location as text
    if (!user?.accessAllLocations) {
        return (
            <div className="location-context">
                <span className="location-context-label">
                    Location
                </span>

                <strong>
                    {activeLocation?.name || "No location assigned"}
                </strong>
            </div>
        );
    }

    function handleChange(event) {
        const locationId = event.target.value;

        if (locationId) {
            selectLocation(locationId);
        } else {
            clearActiveLocation();
        }
    }

    // Owner: show location selector
    return (
        <label className="location-selector">
            <span>Current location</span>

            <select
                value={activeLocationId}
                onChange={handleChange}
            >
                <option value="">Business overview</option>

                {locations.map((location) => (
                    <option
                        key={location._id}
                        value={location._id}
                    >
                        {location.name}
                    </option>
                ))}
            </select>
        </label>
    );
}