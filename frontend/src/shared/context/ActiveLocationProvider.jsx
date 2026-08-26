import { useCallback, useEffect, useMemo, useState } from "react";
import useAuth from "../../features/auth/hooks/useAuth";
import { getLocations } from "../api/location.api";
import { ActiveLocationContext } from "./activeLocationContext";

function storageKey(user) {
    if (!user) return null;

    return `activeLocation:${user.businessId}:${user._id}`;
}

export default function ActiveLocationProvider({ children }) {
    const { user } = useAuth();

    const [locations, setLocations] = useState([]);
    const [activeLocationId, setActiveLocationId] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // re-load locations when user is changed
    const loadLocations = useCallback(async () => {
        // if user is null
        if (!user) {
            setLocations([]);
            setActiveLocationId("");
            setLoading(false);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // get locations and set locations 
            const response = await getLocations();
            const availableLocations = response.locations || [];

            setLocations(availableLocations);

            // get the savedLocationId from the localStorage
            const key = storageKey(user);
            const savedLocationId = key 
                ? window.localStorage.getItem(key)
                : null;

            // If the activeLocationId === one of the availableLocationsId ==> set to activeLocation 
            const savedLocationIsAllowed = availableLocations.some(
                (location) => location._id === savedLocationId
            )

            if (savedLocationIsAllowed) {
                setActiveLocationId(savedLocationId);
                return;
            }

            /*
             * Owners start without an active location so they see the
             * business dashboard. Staff/managers enter their first assigned
             * location automatically.
             */

            const initialLocationId = user.accessAllLocations 
                ? ""
                : availableLocations[0]?._id || "";
            
            setActiveLocationId(initialLocationId);

            if (key && initialLocationId) {
                window.localStorage.setItem(key, initialLocationId);
            } else if (key) {
                window.localStorage.removeItem(key);
            }

        } catch (requestError) {
            setLocations([]);
            setActiveLocationId("");
            setError(requestError.message || "Unable to load your locations");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadLocations();
    }, [loadLocations]);

    // select a location
    const selectLocation = useCallback((locationId) => {
        const permitted = locations.some((location) => location._id === locationId);

        if (!permitted) return false;

        setActiveLocationId(locationId);

        const key = storageKey(user);
        
        if (key) {
            window.localStorage.setItem(key, locationId);
        }

        return true;
    }, [locations, user]);

    // clear active location when authenticated user changed 
    const clearActiveLocation = useCallback(() => {
        setActiveLocationId("");

        const key = storageKey(user);

        if (key) {
            window.localStorage.removeItem(key);
        }
    }, [user]);

    // save the activeLocation value 
    const activeLocation = useMemo(
        () => locations.find(
            (location) => location._id === activeLocationId
        ) || null,
        [locations, activeLocationId]
    );

    const value = useMemo(
        () => ({
            locations,
            activeLocation,
            activeLocationId,
            selectLocation,
            clearActiveLocation,
            reloadLocations: loadLocations,
            loading,
            error
        }),
        [
            locations,
            activeLocation,
            activeLocationId,
            selectLocation,
            clearActiveLocation,
            loadLocations,
            loading,
            error
        ]
    );

    // Anything inside ActiveLocationContext.Provider can access value through ActiveLocationContext 
    return (
        <ActiveLocationContext.Provider value={value}>
            {children}
        </ActiveLocationContext.Provider>
    )
}