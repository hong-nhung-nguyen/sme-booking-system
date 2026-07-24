import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import ScheduleCalendar from '../features/schedule/pages/ScheduleCalendar';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Temporary destination after login */}
        <Route
          path="/schedule-calendar"
          element={<ScheduleCalendar />}
        />

        {/* Redirect the home page to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown routes */}
        <Route path="*" element={<h1>Page not found</h1>} />
      </Routes>
    </>
  )
}
