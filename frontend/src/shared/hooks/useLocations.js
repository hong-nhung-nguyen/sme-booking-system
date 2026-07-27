import { useEffect, useState } from "react";
import { getLocations } from "../api/location.api";

const STORAGE_KEY = "selectedLocationId";

/**
 * Loads the locations the user may work with and remembers which one they
 * picked. Services and new bookings are both location-scoped, so nearly every
 * screen needs this.
 */
export default function useLocations() {
    const [locations, setLocations] = useState([]);
    const [selectedLocationId, setSelected] = useState(
        () => window.localStorage.getItem(STORAGE_KEY) || ""
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        getLocations()
            .then((response) => {
                if (cancelled) return;

                const list = response.locations || [];

                setLocations(list);

                /*
                 * Fall back to the first location when nothing is stored yet,
                 * or when the stored one is no longer available to this user.
                 */
                setSelected((current) => {
                    const stillValid = list.some(
                        (location) => location._id === current
                    );

                    return stillValid ? current : list[0]?._id || "";
                });
            })
            .catch((requestError) => {
                if (!cancelled) {
                    setError(requestError.message || "Unable to load locations");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    function selectLocation(locationId) {
        setSelected(locationId);

        if (locationId) {
            window.localStorage.setItem(STORAGE_KEY, locationId);
        }
    }

    return { locations, selectedLocationId, selectLocation, loading, error };
}
