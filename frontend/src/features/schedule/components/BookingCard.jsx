import { formatTime, getGuestName } from '../schedule.utils';

export default function BookingCard({ appointment, sidebar = false }) {
  return <article className={['booking-card', `status-${appointment.status}`, sidebar ? 'sidebar-booking' : ''].join(' ')}>
    <span className="status-dot" title={appointment.status} aria-label={`Status: ${appointment.status}`} />
    <div className="booking-details"><strong>{getGuestName(appointment)}</strong><small>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</small></div>
    <span className="party-size">P{appointment.partySize || 1}</span>
  </article>;
}
