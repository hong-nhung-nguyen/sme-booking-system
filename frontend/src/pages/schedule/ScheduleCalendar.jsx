import { useCallback, useEffect, useMemo, useState } from "react";
import { getAppointmentsByDate } from "../../api/appointment.api";
import './ScheduleCalendar.css';

const START_HOUR = 8;
const END_HOUR = 22;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const navigationItems = [
    ['▦', 'Dashboard'],
    ['▣', 'Schedule'],
    ['◷', 'History'],
    ['✉', 'AI Messaging'],
    ['◇', 'Floor Plan'],
    ['⚒', 'Service Management'],
];

// Receives a Date object
function toDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// value's format should be YYYY-MM-DD
// output = Thu, 16 Jul 2026
function formatDate(value) {
    // turn into a readable Australian-style date 
    return new Intl.DateTimeFormat('en-AU', {
        weekday: "short", // Monday -> Mon
        day: "2-digit",
        month: "2-digit", // Janurary -> Jan
        year: "numeric"
    }).format(new Date(`${value}T12:00:00`));
    /**
     * Using T12:00:00 helps prevent the date unexpectedly moving to the previous
     * or next day because of timezone conversion (12 at noon)
     */
};

/**
 * converts a date/time value into 24-hour format (e.g 08:30 / 19:45)
 * value = ISO string (e.g '2026-07-16T08:30:00.000Z')
 */
function formatTime(value) {
    return new Intl.DateTimeFormat('en-AU', {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // use 24-hour instead of AM/PM
    }).format(new Date(value));
};

function getId(value) {
    return typeof value === "object" ? value._id : value;
};

/**
 * value = object
 * 6878ab1234567890abcd12ef -> 12EF
 */
function shortId(value) {
    const id = getId(value);

    return id ? String(id).slice(-4).toUpperCase() : "-";
};

function getGuestName(appointment) {
    const fullName = [appointment.clientFirstName, appointment.clientLastName]
        .filter(Boolean)
        .join(" ");

    return fullName || appointment.clientEmail || appointment.clientPhone 
    || `Guest ${appointment.clientId && shortId(appointment.clientId)}`;
};

function getResourceName(appointment) {
    const resource = appointment.resourceId;

    if (resource && typeof resource === "object") {
        return resource.number ? resource.number : "Unassigned"
    }

    return resource ? `${shortId(resource)}` : "Unassigned";
};

/**
 * value = ISO string 
 * minutes after the calendar begins at 8AM
 */
function minutesFromStart(value) {
    const date = new Date(value);

    return (
        date.getHours() * 60 + 
        date.getMinutes() - 
        START_HOUR * 60 
    )
};

/**
 * value = ISO string
 */
function getPosition(value) {
    const percentage = (minutesFromStart(value) / TOTAL_MINUTES) * 100;

    /**
     * Math.max = preventing the result from going below 0 (before openingHour)
     * Math.min = preventing the result from going above 100 (after closingHour)
     */
    return Math.max(0, Math.min(100, percentage));
};

/**
 * converts an appointmen's duration in minutes into a percentage of the
 * complete calendar width 
 */
function getWidth(appointment) {
    const duration = appointment.durationMinutes || 90;
    const percentage = (duration / TOTAL_MINUTES) * 100;

    /**
     * The min 4% ensures short bookings remain visible
     * The max 100% prevents one booking from being wider than the entire calendar
     */
    return (Math.max(4, Math.min(100, percentage)));
};

// --------------------------------------------------------

function MetricCard({ label, value, className = '' }) {
    return (
        <>
            <article className="metric-card">
                <span>{label}</span>
                <strong className={className}>{value}</strong>
            </article>
        </>
    )
}

// --------------------------------------------------------

function BookingCard({ appointment, sidebar = false }) {
    return (
        <>
            <article
                className={[
                    'booking-card',
                    `status-${appointment.status}`,
                    sidebar ? 'sidebar-booking' : ''
                ].join(" ")}
            >
                <span 
                    className="status-dot"
                    title={appointment.status}
                    arial-label={`Status: ${appointment.status}`}
                />

                <div className="booking-details">
                    <strong>{getGuestName(appointment)}</strong>

                    <small>
                        {formatTime(appointment.startTime)}
                        {' - '}
                        {formatTime(appointment.endTime)}
                    </small>
                </div>

                <span className="party-size">
                    P{appointment.partySize || 1}
                </span>

                
            </article>
        </>
    )
}

// --------------------------------------------------------

export default function ScheduleCalendar() {
    const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));

    const [appointments, setAppointments] = useState([]);
    const [navigationOpen, setNavigationOpen] = useState(false);
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

    return (
        <main className="schedule-page">
            <aside className="schedule-sidebar">
                <header className="brand">
                    <button
                        className="menu-button"
                        type="button"
                        aria-label={
                            navigationOpen 
                                ? "Show booking list"
                                : "Open navigation"
                        }
                        onClick={() => setNavigationOpen((current) => !current)}
                    >
                        <span />
                        <span />
                        <span />
                    </button>

                    <strong>Sunset Bistro</strong>
                </header>

                {navigationOpen ? (
                    <nav
                        className="main-navigation"
                        aria-label="Main navigation"
                    >
                        {navigationItems.map(([icon, label]) => (
                            <a
                                href="#"
                                key={label}
                                className={
                                    label === 'Schedule' ? "active" : ""
                                }
                            >
                                <span>{icon}</span>
                                {label}
                            </a>
                        ))}

                        <button
                            className="new-reservation"
                            type="button"
                        >
                            ⊕ New Reservation
                        </button>

                        <div className="secondary-navigation">
                            <a href="#">⚙ Settings</a>
                            <a href="#">? Support</a>
                        </div>
                    </nav>
                ) : (
                    <section
                        className="booking-sidebar"
                        aria-label="Bookings"
                    >
                        {loading && (
                            <p className="sidebar-message">
                                Loading bookings...
                            </p>
                        )}

                        {!loading && appointments.length === 0 && (
                            <p className="sidebar-message">
                                No bookings for this date.
                            </p>
                        )}

                        {appointments  
                            .slice()
                            .sort(
                                (first, second) => new Date(first.startTime) - new Date(second.startTime)
                            )
                            .map((appointment) => (
                                <BookingCard 
                                    appointment={appointment}
                                    sidebar
                                    key={appointment._id}
                                />
                            ))
                        }
                    </section>
                )}
            </aside>

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
                            araia-label="Schedule date"
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
                    >
                        ＋
                    </button>
                </div>

            </section>
        </main>
    )
}





