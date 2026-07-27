import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, logout as logoutRequest } from "../api/auth.api";
import { AUTH_EXPIRED_EVENT } from "../../../shared/api/apiClient";
import { AuthContext } from "./authContext";

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    /**
     * Starts as true so ProtectedRoute waits for the first /auth/me probe
     * instead of bouncing an already-signed-in user back to the login page.
     */
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await getCurrentUser();

            setUser(response.user || null);

            return response.user || null;
        } catch {
            /*
             * A failure here just means "not signed in" — the caller does not
             * need to distinguish between a missing and an expired session.
             */
            setUser(null);

            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    // The api client fires this when a refresh attempt could not save the session
    useEffect(() => {
        function handleExpiry() {
            setUser(null);
            setLoading(false);
        }

        window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiry);

        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiry);
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } catch {
            // Clear the session locally even if the server call failed
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({ user, loading, refreshUser, logout }),
        [user, loading, refreshUser, logout]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
