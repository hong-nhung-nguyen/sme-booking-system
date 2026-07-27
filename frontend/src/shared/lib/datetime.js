/**
 * Date helpers shared by the schedule, the booking form and the detail page.
 * The backend stores `date` as a YYYY-MM-DD string and `startTime` as a Date,
 * so these convert between that and what <input> elements expect.
 */

// Date object -> "YYYY-MM-DD" in the browser's local timezone
export function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Date/ISO -> "HH:mm" for <input type="time">
export function toTimeInputValue(value) {
    const date = new Date(value);

    return [date.getHours(), date.getMinutes()]
        .map((part) => String(part).padStart(2, "0"))
        .join(":");
}

/**
 * Combines the two form inputs into an absolute instant.
 * Building the Date from parts (rather than parsing "YYYY-MM-DDTHH:mm")
 * keeps it unambiguously local before it is serialised to ISO.
 */
export function combineDateAndTime(dateValue, timeValue) {
    const [year, month, day] = dateValue.split("-").map(Number);
    const [hour, minute] = timeValue.split(":").map(Number);

    return new Date(year, month - 1, day, hour, minute, 0, 0);
}

/**
 * "YYYY-MM-DD" -> "Thu, 16/07/2026".
 * The T12:00:00 keeps the date from slipping a day when the string is parsed
 * as UTC and then rendered in a local timezone.
 */
export function formatDate(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("en-AU", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(`${value}T12:00:00`));
}

// Date/ISO -> "08:30" (24-hour)
export function formatTime(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(value));
}

// Date/ISO -> "16/07/2026, 08:30" for audit trails
export function formatDateTime(value) {
    if (!value) return "-";

    return new Intl.DateTimeFormat("en-AU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).format(new Date(value));
}

// Shifts a "YYYY-MM-DD" string by whole days without timezone drift
export function shiftDate(value, numberOfDays) {
    const [year, month, day] = value.split("-").map(Number);
    const next = new Date(year, month - 1, day);

    next.setDate(next.getDate() + numberOfDays);

    return toDateInputValue(next);
}
