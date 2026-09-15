import { Link, Navigate } from "react-router-dom";
import useAuth from "../../auth/hooks/useAuth";
import useActiveLocation from "../../../shared/hooks/useActiveLocation";
import "./FloorPlanPage.css";

export default function FloorPlanEditorEntry({ mode }) {
    const { user } = useAuth();
    const { activeLocation, loading } = useActiveLocation();

    if (!["owner", "manager"].includes(user?.role)) {
        return <Navigate to="/floor-plan" replace />;
    }

    if (loading) {
        return (
            <main className="fp-page">
                <p role="status">Loading location…</p>
            </main>
        );
    }

    if (!activeLocation) {
        return <Navigate to="/floor-plan" replace />;
    }

    return (
        <main className="fp-page">
            <section className="fp-state">
                <h1>{mode === "create" ? "Create Layout" : "Edit Layout"}</h1>
                <p>{activeLocation.name}</p>
                <p>
                    Layout editing is not available yet. No changes have been saved.
                </p>
                <Link className="fp-button" to="/floor-plan">
                    Back to Floor Plan
                </Link>
            </section>
        </main>
    );
}