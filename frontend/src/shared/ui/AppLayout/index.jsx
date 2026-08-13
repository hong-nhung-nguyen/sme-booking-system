import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../features/auth/hooks/useAuth";
import NavSider from "../NavSider/NavSider";
import { LayoutContext } from "./layoutContext";
import "./AppLayout.css";

function initials(user) {
    const letters = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .map((part) => part[0]);

    if (letters.length > 0) return letters.join("").toUpperCase();

    return (user?.email || "?").slice(0, 2).toUpperCase();
}

// Used for the topbar heading, so each page does not have to repeat it
function sectionTitle(pathname) {
    if (pathname.startsWith("/bookings/new")) return "New Booking";
    if (pathname.endsWith("/edit")) return "Edit Booking";
    if (pathname.startsWith("/bookings")) return "Booking";
    if (pathname.startsWith("/schedule")) return "Schedule";
    if (pathname.startsWith("/messages")) return "AI Messaging";

    return "Booking Manager";
}

export default function AppLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // A page may hand us its own sidebar; otherwise the navigation is shown
    const [sidebar, setSidebar] = useState(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const layoutValue = useMemo(() => ({ setSidebar }), []);

    async function handleLogout() {
        await logout();
        navigate("/login", { replace: true });
    }

    return (
        <LayoutContext.Provider value={layoutValue}>
            <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
                {sidebar || (
                    <NavSider
                        collapsed={sidebarCollapsed}
                        onToggleCollapse={() => setSidebarCollapsed((collapsed) => !collapsed)}
                        onNewReservation={() => navigate("/bookings/new")}
                    />
                )}

                <section className="app-content">
                    <header className="topbar">
                        <h2 className="topbar-title">
                            {sectionTitle(location.pathname)}
                        </h2>

                        <div className="topbar-user">
                            <span className="user-name">
                                {[user?.firstName, user?.lastName]
                                    .filter(Boolean)
                                    .join(" ")}
                                {user?.role && <em>{user.role}</em>}
                            </span>

                            <span className="avatar" aria-hidden="true">
                                {initials(user)}
                            </span>

                            <button
                                className="logout-button"
                                type="button"
                                onClick={handleLogout}
                            >
                                Sign out
                            </button>
                        </div>
                    </header>

                    <Outlet />
                </section>
            </div>
        </LayoutContext.Provider>
    );
}
