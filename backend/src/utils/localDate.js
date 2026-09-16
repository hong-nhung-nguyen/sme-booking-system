/**
 * Returns the calendar date (YYYY-MM-DD) for `instant` as seen in `timezone`.
 * The en-CA locale formats dates as YYYY-MM-DD already.
 */

module.exports.localDate = (timezone, instant = new Date()) => {
    return new Intl.DateTimeFormat("en-CA", {
        timezone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(instant);
};