import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from '../../auth/api/auth.api';
import { getAppointmentsByDate, getServicesByLocation } from '../api/appointment.api';import BookingCard from '../components/BookingCard';
import MetricCard from '../components/MetricCard';
import { END_HOUR, formatDate, formatTime, getPosition, getResourceName, getWidth, START_HOUR, toDateInputValue } from '../schedule.utils';
import './ScheduleCalendar.css';
import NavSider from '../../../shared/ui/NavSider/NavSider';
import NewBookingModal from '../components/NewBookingModal';
import ScheduleBookingSidebar from '../components/ScheduleBookingSidebar';


export default function ScheduleCalendar() {
    const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));

    const [locationId, setLocationId] = useState('');
    const [services, setServices] = useState([]);
    const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
    const [showNavigation, setShowNavigation] = useState(true);
    const [appointments, setAppointments] = useState([]);
    // const [navigationOpen, setNavigationOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [now, setNow] = useState(new Date())

    const loadAppointments = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await getAppointmentsByDate(selectedDate);
            setAppointments(response.appointments || [])
        } catch (requestedError) {
            // backend currently returns 404 when a date has no bookings
            if (requestedError.status === 404) {
                setAppointments([])
            } else {
                setError(
                    requestedError.message || "Unable to load appointments"
                )
            }
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        loadAppointments()
    }, [loadAppointments])

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date())
        }, 60000) // update the current time every 1 minute

        // clear the timer when the component is unmounted
        /**
         * function cleanUp() {
         *      window.clearInterval(timer)
         * }
         * 
         * return cleanUp
         */
        return () => window.clearInterval(timer); 
    }, []);

    useEffect(() => {
    async function loadBookingFormData() {
        try {
            const response = await getCurrentUser();

            const firstLocationId = response.user.locationIds?.[0];

            if (!firstLocationId) {
                return;
            }

            setLocationId(String(firstLocationId));

            const locationServices = await getServicesByLocation(
                String(firstLocationId)
            );

            setServices(locationServices);
        } catch (error) {
            console.error('Unable to load booking form data:', error);
        }
    }
    loadBookingFormData();
    }, []); 

    const appointmentsByResource = useMemo(() => {
        const groups = new Map();

        appointments.forEach((appointment) => {
            const resourceName = getResourceName(appointment);

            if (!groups.has(resourceName)) {
                groups.set(resourceName, []);
            }

            groups.get(resourceName).push(appointment);
        });

        // sort aphabetically 
        return Array.from(groups.entries()).sort(([first], [second]) => first.localeCompare(second))
    }, [appointments]);

    const totals = useMemo(() => {
        const active = appointments.filter(
            (appointment) => appointment.status !== "cancelled"
        )

        return {
            bookings: active.length,

            covers: active.reduce((total, appointment) => {
                return total + (appointment.partySize || 0)
            }, 0),

            seated: appointments
                .filter((appointment) => appointment.status === "seated").length,
            
            walkIns: appointments
                .filter((appointment) => appointment.status === "walkIn").length,
        }
    }, [appointments]);

    // Create an array of n length and run callback for each element
    const timeLineLabels = Array.from(
        { length: (END_HOUR - START_HOUR) * 2 + 1},
        (_, index) => {
            const totalMinutes = START_HOUR * 60 + index * 30;
            const hour = Math.floor(totalMinutes / 60);
            const minute = totalMinutes % 60;
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
        }
    );

    const today = toDateInputValue(now);
    const showCurrentTime = selectedDate === today;
    const currentTimePosition = getPosition(now);

    function changeDate(numberOfDays) {
        const nextDate = new Date(`${selectedDate}`);

        nextDate.setDate(nextDate.getDate() + numberOfDays);
        setSelectedDate(toDateInputValue(nextDate));
    };

    function connectGoogleCalendar() {
        window.location.assign("/api/v1/google-calendar/auth")
    }

    return (
        <main className="schedule-page">
            {showNavigation ? (
                <NavSider
                    onNewReservation={() => setBookingDialogOpen(true)}
                    onShowBookings={() => setShowNavigation(false)}
                />
            ) : (
                <ScheduleBookingSidebar
                    appointments={appointments}
                    loading={loading}
                    onShowNavigation={() => setShowNavigation(true)}
                />
            )}

            <section className="schedule-content">
                <header className="topbar">
                    <label className="search-box">
                        <span>⌕</span>

                        <input 
                            type="search"
                            placeholder="Search guests or resources..."
                        />
                    </label>

                    <div className="date-control">
                        <button 
                            type="button"
                            onClick={() => changeDate(-1)}
                            aria-label="Previous day"
                        >
                            ‹
                        </button>

                        <input 
                            type="date"
                            value={selectedDate}
                            aria-label="Schedule date"
                            onChange={(event) => setSelectedDate(event.target.value)}
                        />

                        <button
                            type="button"
                            onClick={() => changeDate(1)}
                        >
                            ›
                        </button>
                    </div>

                    <div className="view-switch">
                        <strong>Schedule</strong>
                        <span>Analytics</span>
                    </div>

                    <button
                        className="header-icon"
                        type="button"
                        aria-label="Notification"
                    >
                        ♧
                    </button>

                    <button
                        className="avatar"
                        type="button"
                        aria-label="Account"
                    >
                        SB
                    </button>
                </header>

                <div className="schedule-body">
                    <section className="overview">
                        <div className="overview-heading">
                            <h1>Daily Overview</h1>

                            <p>
                                Managing {appointments.length} bookings accross{' '}
                                {appointmentsByResource.length} tables
                            </p>
                        </div>

                        <div className="metrics">
                            <MetricCard 
                                label="Bookings"
                                value={totals.bookings}
                                className="blue"
                            />

                            <MetricCard 
                                label="Covers"
                                value={totals.covers}
                            />

                            <MetricCard 
                                label="Seated"
                                value={totals.seated}
                                className="green"
                            />

                            <MetricCard 
                                label="Walk-ins"
                                value={totals.walkIns}
                            />
                        </div>
                    </section>

                    <section className="filters">
                        <select aria-label="Service filter">
                            <option>All Services</option>
                        </select>

                        <select aria-label="Section filter">
                            <option>All Sections</option>
                        </select>

                        <button type="button">☷ More Filters</button>
                    </section>

                    {error && (
                        <div className="schedule-error" role="alert">
                            {error}
                        </div>
                    )}

                    <section
                        className="calendar"
                        aria-label="Live booking schedule"
                    >
                        <header className="calendar-header">
                            <strong>TABLE / SECTION</strong>

                            <div className="timeline-labels">
                                {timeLineLabels.map((label) => (
                                    <span key={label}>{label}</span>
                                ))}
                            </div>
                        </header>

                        <div className="calendar-content">
                            {!loading && appointmentsByResource.length === 0 && (
                                <div className="empty-calendar">
                                    No bookings to display for{' '}
                                    {formatDate(selectedDate)}
                                </div>
                            )}

                            {appointmentsByResource.map(([resourceName, bookings]) => (
                                <div
                                    className="calendar-row"
                                    key={resourceName}
                                >
                                    <div className="resource-cell">
                                        <strong>{resourceName}</strong>

                                        <span>
                                            {Math.max(
                                                ...bookings.map((booking) => booking.partySize || 0), 0
                                            )}{' '}
                                            covers
                                        </span>
                                    </div>

                                    <div className="timeline-track">
                                        {bookings.map((appointment) => (
                                            <div
                                                className="timeline-booking"
                                                key={appointment._id}
                                                style={{
                                                    left: `${getPosition(appointment.startTime)}%`,
                                                    width: `${getWidth(appointment)}%`
                                                }}
                                            >
                                                <BookingCard 
                                                    appointment={appointment}
                                                />
                                            </div>
                                        ))}

                                    </div>
                                </div>
                            ))}

                            {showCurrentTime && currentTimePosition >= 0 && currentTimePosition <= 100 && (
                                <div
                                    className="current-time"
                                    style={{
                                        left: `calc(116px + (100% - 116px) * ${currentTimePosition / 100})`
                                    }}
                                >
                                    <span>{formatTime(now)}</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                
                <div className="floating-actions">
                    <button
                        type="button"
                        aria-label="Refresh bookings"
                        onClick={loadAppointments}
                    >
                        ↻
                    </button>

                    <button
                        className="add-button"
                        type="button"
                        aria-label="New reservation"
                        onClick={() => setBookingDialogOpen(true)}
                    >
                        ＋
                    </button>
                </div>

            </section>

            <NewBookingModal
                open={bookingDialogOpen}
                onClose={() => setBookingDialogOpen(false)}
                onSaved={loadAppointments}
                selectedDate={selectedDate}
                locationId={locationId}
                services={services}
            />

        </main>
    )
}





