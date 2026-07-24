export const START_HOUR = 8;
export const END_HOUR = 22;
export const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

export function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function formatTime(value) {
  return new Intl.DateTimeFormat('en-AU', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(value));
}

function getId(value) { return typeof value === 'object' ? value?._id : value; }
function shortId(value) { const id = getId(value); return id ? String(id).slice(-4).toUpperCase() : '-'; }

export function getGuestName(appointment) {
  const fullName = [appointment.clientFirstName, appointment.clientLastName].filter(Boolean).join(' ');
  return fullName || appointment.clientEmail || appointment.clientPhone || `Guest ${appointment.clientId && shortId(appointment.clientId)}`;
}

export function getResourceName(appointment) {
  const resource = appointment.resourceId;
  if (resource && typeof resource === 'object') return resource.number ? resource.number : 'Unassigned';
  return resource ? `${shortId(resource)}` : 'Unassigned';
}

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
