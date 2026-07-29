import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    changeAppointmentStatus,
    deleteAppointment,
    getAppointment,
    getStatusHistory,
} from "../../schedule/api/appointment.api";
import ConfirmDialog from "../../../shared/ui/ConfirmDialog/index";
import PageLoader from "../../../shared/ui/PageLoader";
import StatusBadge from "../../../shared/ui/StatusBadge/index";
import Spinner from "../../../shared/ui/Spinner";
import { nextStatuses, statusLabel } from "../../../shared/constants/appointmentStatus";
import useAuth, { actorName } from "../../auth/hooks/useAuth";
import {
    getClient,
    getResourceName,
    getServiceName,
    shortId,
} from "../../../shared/lib/appointment";
import { formatDate, formatDateTime, formatTime } from "../../../shared/lib/datetime";
import "./booking.css";

const SYNC_LABELS = {
    synced: "Synced to Google Calendar",
    not_synced: "Not synced",
    failed: "Google Calendar sync failed",
};

function DetailRow({ label, children }) {
    return (
        <div className="detail-row">
            <span>{label}</span>
            <strong>{children}</strong>
        </div>
    );
}

export default function BookingDetail() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [appointment, setAppointment] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [pendingStatus, setPendingStatus] = useState("");

    // Which confirmation is open: "cancel", "delete" or none
    const [dialog, setDialog] = useState(null);
    const [dialogBusy, setDialogBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [detail, historyResponse] = await Promise.all([
                getAppointment(appointmentId),
                getStatusHistory(appointmentId),
            ]);

            setAppointment(detail.data);
            setHistory(historyResponse.data || []);
        } catch (requestError) {
            setError(
                requestError.status === 404
                    ? "This booking no longer exists."
                    : requestError.message || "Unable to load this booking"
            );
        } finally {
            setLoading(false);
        }
    }, [appointmentId]);

    useEffect(() => {
        load();
    }, [load]);

    async function applyStatus(status, reason) {
        setActionError("");
        setPendingStatus(status);

        try {
            await changeAppointmentStatus(appointmentId, status, {
                updatedBy: actorName(user),
                ...(reason ? { reason } : {}),
            });

            await load();
        } catch (requestError) {
            setActionError(
                requestError.message || `Unable to mark this booking ${status}`
            );
        } finally {
            setPendingStatus("");
        }
    }

    async function handleCancel(reason) {
        setDialogBusy(true);

        try {
            await applyStatus("cancelled", reason);
            setDialog(null);
        } finally {
            setDialogBusy(false);
        }
    }

    async function handleDelete(reason) {
        setDialogBusy(true);
        setActionError("");

        try {
            await deleteAppointment(appointmentId, {
                deleter: actorName(user),
                reason,
            });

            navigate("/schedule-calendar", { replace: true });
        } catch (requestError) {
            setActionError(
                requestError.message || "Unable to delete this booking"
            );
            setDialog(null);
        } finally {
            setDialogBusy(false);
        }
    }

    if (loading) {
        return <PageLoader label="Loading booking" />;
    }

    if (error || !appointment) {
        return (
            <div className="booking-page">
                <div className="schedule-error" role="alert">
                    {error || "Booking not found"}
                </div>

                <Link className="back-link" to="/schedule-calendar">
                    ‹ Back to schedule
                </Link>
            </div>
        );
    }

    const client = getClient(appointment);

    /*
     * Cancel gets its own button with a reason prompt, so leave it out of the
     * quick actions to avoid offering the same transition twice.
     */
    const quickActions = nextStatuses(appointment.status).filter(
        (status) => status !== "cancelled"
    );

    const canCancel = nextStatuses(appointment.status).includes("cancelled");

    return (
        <div className="booking-page">
            <Link className="back-link" to="/schedule-calendar">
                ‹ Back to schedule
            </Link>

            <header className="booking-header">
                <div>
                    <h1>
                        {client
                            ? [client.firstName, client.lastName]
                                  .filter(Boolean)
                                  .join(" ")
                            : `Guest ${shortId(appointment.clientId)}`}
                    </h1>

                    <p>
                        {formatDate(appointment.date)} ·{" "}
                        {formatTime(appointment.startTime)} –{" "}
                        {formatTime(appointment.endTime)} ·{" "}
                        {getServiceName(appointment)}
                    </p>
                </div>

                <div className="booking-header-actions">
                    <StatusBadge status={appointment.status} />

                    <Link
                        className="button-secondary"
                        to={`/bookings/${appointmentId}/edit`}
                    >
                        Edit
                    </Link>

                    {canCancel && (
                        <button
                            type="button"
                            className="button-secondary"
                            onClick={() => setDialog("cancel")}
                        >
                            Cancel booking
                        </button>
                    )}

                    <button
                        type="button"
                        className="button-danger"
                        onClick={() => setDialog("delete")}
                    >
                        Delete
                    </button>
                </div>
            </header>

            {actionError && (
                <div className="schedule-error" role="alert">
                    {actionError}
                </div>
            )}

            <div className="booking-grid">
                <section className="booking-panel">
                    <h2>Booking</h2>

                    <DetailRow label="Service">
                        {getServiceName(appointment)}
                    </DetailRow>

                    <DetailRow label="Date">
                        {formatDate(appointment.date)}
                    </DetailRow>

                    <DetailRow label="Time">
                        {formatTime(appointment.startTime)} –{" "}
                        {formatTime(appointment.endTime)}
                    </DetailRow>

                    <DetailRow label="Duration">
                        {appointment.durationMinutes} minutes
                    </DetailRow>

                    <DetailRow label="Party size">
                        {appointment.partySize || 1}
                    </DetailRow>

                    <DetailRow label="Resource">
                        {getResourceName(appointment)}
                    </DetailRow>

                    <DetailRow label="Channel">{appointment.channel}</DetailRow>

                    <DetailRow label="Timezone">{appointment.timezone}</DetailRow>

                    <DetailRow label="Calendar">
                        <span
                            className={`sync-badge sync-${appointment.googleCalendarSyncStatus}`}
                        >
                            {SYNC_LABELS[appointment.googleCalendarSyncStatus] ||
                                appointment.googleCalendarSyncStatus}
                        </span>
                    </DetailRow>

                    {appointment.note && (
                        <DetailRow label="Note">{appointment.note}</DetailRow>
                    )}
                </section>

                <section className="booking-panel">
                    <h2>Guest</h2>

                    <DetailRow label="Name">
                        {client
                            ? [client.firstName, client.lastName]
                                  .filter(Boolean)
                                  .join(" ")
                            : "-"}
                    </DetailRow>

                    <DetailRow label="Email">{client?.email || "-"}</DetailRow>

                    <DetailRow label="Phone">{client?.phone || "-"}</DetailRow>

                    <h2 className="panel-subheading">Move to</h2>

                    {quickActions.length === 0 ? (
                        <p className="panel-empty">
                            {statusLabel(appointment.status)} is a final status.
                        </p>
                    ) : (
                        <div className="status-actions">
                            {quickActions.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    className="button-secondary"
                                    disabled={Boolean(pendingStatus)}
                                    onClick={() => applyStatus(status)}
                                >
                                    {pendingStatus === status && <Spinner />}
                                    {statusLabel(status)}
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                <section className="booking-panel booking-history">
                    <h2>Status history</h2>

                    {history.length === 0 && (
                        <p className="panel-empty">No status changes recorded yet.</p>
                    )}

                    <ol className="history-list">
                        {history.map((entry, index) => (
                            <li key={`${entry.status}-${entry.updatedAt}-${index}`}>
                                <StatusBadge status={entry.status} />

                                <div className="history-meta">
                                    <span>{formatDateTime(entry.updatedAt)}</span>

                                    {entry.updatedBy && <span>by {entry.updatedBy}</span>}

                                    {entry.reason && <em>{entry.reason}</em>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            <ConfirmDialog
                open={dialog === "cancel"}
                title="Cancel this booking?"
                description="The booking stays on the schedule marked as cancelled, and the reason is recorded in its history."
                confirmLabel="Cancel booking"
                cancelLabel="Keep booking"
                reasonLabel="Reason"
                busy={dialogBusy}
                onConfirm={handleCancel}
                onCancel={() => setDialog(null)}
            />

            <ConfirmDialog
                open={dialog === "delete"}
                title="Delete this booking?"
                description="Deleting removes the booking from the schedule entirely. This is different from cancelling and cannot be undone from the app."
                confirmLabel="Delete"
                destructive
                reasonLabel="Reason"
                busy={dialogBusy}
                onConfirm={handleDelete}
                onCancel={() => setDialog(null)}
            />
        </div>
    );
}
