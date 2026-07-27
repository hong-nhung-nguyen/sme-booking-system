import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../features/auth/hooks/useAuth";
import PageLoader from "./PageLoader";

export default function ProtectedRoute() {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Wait for the first /auth/me probe before deciding anything
    if (loading) {
        return <PageLoader label="Checking your session" />;
    }

    if (!user) {
        /*
         * Remember where the user was headed so the login page can send
         * them back there instead of always landing on the schedule.
         */
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
