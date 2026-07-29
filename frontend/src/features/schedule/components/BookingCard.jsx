import { formatTime, getGuestName } from '../schedule.utils';

/**
 * Renders as a button when onOpen is supplied, so a booking can be opened
 * from both the timeline and the sidebar list.
 */
export default function BookingCard({ appointment, sidebar = false, onOpen }) {
  const className = [
    'booking-card',
    `status-${appointment.status}`,
    sidebar ? 'sidebar-booking' : '',
  ].join(' ');

  const content = (
    <>
      <span
        className="status-dot"
        title={appointment.status}
        aria-hidden="true"
      />

      <div className="booking-details">
        <strong>{getGuestName(appointment)}</strong>
        <small>
          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
        </small>
      </div>

      <span className="party-size">P{appointment.partySize || 1}</span>
    </>
  );

  if (!onOpen) {
    return <article className={className}>{content}</article>;
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => onOpen(appointment)}
    >
      {content}
    </button>
  );
}
