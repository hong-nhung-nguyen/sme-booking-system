import BookingCard from './BookingCard';

export default function ScheduleBookingSidebar({ appointments, loading, onShowNavigation, onOpen }) {
  return (
    <aside className="booking-sidebar" aria-label="Bookings for the selected date">
      <header className="booking-sidebar-header">
        <h2>Bookings</h2>
        <button className="sidebar-switch" type="button" onClick={onShowNavigation}>Navigation</button>
      </header>
      {loading && <p className="sidebar-message">Loading bookings...</p>}
      {!loading && appointments.length === 0 && <p className="sidebar-message">No bookings for this date.</p>}
      {appointments.slice().sort((first, second) => new Date(first.startTime) - new Date(second.startTime)).map((appointment) => (
        <BookingCard appointment={appointment} sidebar onOpen={onOpen} key={appointment._id} />
      ))}
    </aside>
  );
}
