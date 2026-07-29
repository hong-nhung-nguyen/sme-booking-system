/**
 * Timeline geometry for the schedule. The date formatting and appointment
 * field readers live in shared/lib so the booking pages can use them too;
 * they are re-exported here so existing schedule imports keep working.
 */

export {
  formatDate,
  formatTime,
  toDateInputValue,
} from '../../shared/lib/datetime';

export { getGuestName, getResourceName } from '../../shared/lib/appointment';

export const START_HOUR = 8;
export const END_HOUR = 22;
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

// minutes after the calendar begins at 8AM
function minutesFromStart(value) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes() - START_HOUR * 60;
}

export function getPosition(value) {
  return Math.max(0, Math.min(100, (minutesFromStart(value) / TOTAL_MINUTES) * 100));
}

export function getWidth(appointment) {
  const duration = appointment.durationMinutes || 90;
  return Math.max(4, Math.min(100, (duration / TOTAL_MINUTES) * 100));
}
