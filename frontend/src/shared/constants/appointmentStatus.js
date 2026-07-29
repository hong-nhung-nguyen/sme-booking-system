/**
 * Single source of truth for appointment statuses on the client.
 * The values mirror the enum on src/models/Appointment.model.js — keep both
 * in sync, otherwise the backend rejects the change-status request.
 */

export const APPOINTMENT_STATUSES = [
    { value: "walkIn", label: "Walk-in" },
    { value: "pending", label: "Pending" },
    { value: "unconfirmed", label: "Unconfirmed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "rescheduled", label: "Rescheduled" },
    { value: "queued", label: "Queued" },
    { value: "seated", label: "Seated" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
    { value: "noShow", label: "No-show" },
    { value: "failed", label: "Failed" },
];

const labelByStatus = new Map(
    APPOINTMENT_STATUSES.map(({ value, label }) => [value, label])
);

export function statusLabel(status) {
    return labelByStatus.get(status) || status || "Unknown";
}

/**
 * Which statuses a booking can move to next. Used to render the quick-action
 * buttons on the booking detail page, so staff are not offered transitions
 * that make no sense (e.g. re-seating a completed booking).
 *
 * Statuses missing from this map are terminal.
 */
export const ALLOWED_TRANSITIONS = {
    walkIn: ["seated", "completed", "cancelled", "noShow"],
    pending: ["unconfirmed", "confirmed", "queued", "cancelled"],
    unconfirmed: ["confirmed", "queued", "cancelled", "noShow"],
    confirmed: ["seated", "rescheduled", "cancelled", "noShow"],
    rescheduled: ["confirmed", "seated", "cancelled", "noShow"],
    queued: ["confirmed", "cancelled", "failed"],
    seated: ["completed", "cancelled"],
    failed: ["pending", "cancelled"],
    completed: [],
    cancelled: [],
    noShow: [],
};

export function nextStatuses(status) {
    return ALLOWED_TRANSITIONS[status] || [];
}

/** Statuses that no longer occupy a slot in the day's totals. */
export const INACTIVE_STATUSES = ["cancelled", "noShow", "failed"];
