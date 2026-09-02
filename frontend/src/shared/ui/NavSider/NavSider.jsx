import { NavLink } from 'react-router-dom';
import './NavSider.css';

const navigationItems = [
  { label: 'Dashboard', to: '/dashboard', icon: 'dashboard' },
  { label: 'Bookings', to: '/bookings', icon: 'calendar' },
  { label: 'History', to: '/history', icon: 'history' },
  { label: 'AI Messaging', to: '/messages', icon: 'message' },
  { label: 'Floor Plan', to: '/floor-plan', icon: 'layers' },
  { label: 'Service Management', to: '/service-management', icon: 'tools' },
];

const iconPaths = {
  dashboard: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  calendar: 'M5 4h14v16H5zM8 2v4M16 2v4M5 9h14',
  history: 'M3 12a9 9 0 1 0 3-6.7M3 4v5h5M12 7v5l3 2',
  message: 'M4 5h16v11H8l-4 3zM8 9h8M8 12h5',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 17l9 5 9-5',
  tools: 'm14 6 4-4 3 3-4 4M13 7 5 15l-2 6 6-2 8-8M5 4l3 3M3 7l4-4',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6 1.2 2.5 2.8.5-.5 2.8 2 2-2 2 .5 2.8-2.8.5L12 22l-1.2-2.5-2.8-.5.5-2.8-2-2 2-2-.5-2.8 2.8-.5L12 2',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9a2.5 2.5 0 1 1 3.8 2.1c-.8.5-1.3 1-1.3 2.4M12 17h.01',
};

function Icon({ name }) {
  return <svg aria-hidden="true" className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg>;
}

export default function NavSider({
  collapsed = false,
  onNewReservation,
  onToggleCollapse,
}) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <header className="app-sidebar-brand">
        <button
          className="nav-menu-toggle"
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
        >
          <span /><span /><span />
        </button>
        <strong className="sidebar-label">Sunset Bistro</strong>
      </header>

      <nav className="app-navigation" aria-label="Main navigation">
        {navigationItems.map(({ label, to, icon }) => (
          <NavLink key={label} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
            <Icon name={icon} />
            <span className="sidebar-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {onNewReservation && <button className="app-new-reservation" type="button" onClick={onNewReservation} aria-label="New reservation"><span className="reservation-add-icon" aria-hidden="true">+</span> <span className="sidebar-label">New Reservation</span></button>}

      <div className="app-secondary-navigation">
        <button type="button" aria-label="Settings"><Icon name="settings" /> <span className="sidebar-label">Settings</span></button>
        <button type="button" aria-label="Support"><Icon name="help" /> <span className="sidebar-label">Support</span></button>
      </div>
    </aside>
  );
}
