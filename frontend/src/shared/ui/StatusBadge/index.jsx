import { statusLabel } from "../../constants/appointmentStatus";
import "./StatusBadge.css";

/**
 * The `status-<value>` class supplies the colour tokens defined in index.css,
 * so the badge stays in step with the booking cards on the schedule.
 */
export default function StatusBadge({ status }) {
    const known = Boolean(status) && statusLabel(status) !== status;

    return (
        <span className={`status-badge status-${known ? status : "unknown"}`}>
            <span className="status-dot" aria-hidden="true" />
            {statusLabel(status)}
        </span>
    );
}
