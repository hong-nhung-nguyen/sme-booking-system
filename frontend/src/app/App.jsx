import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../shared/ui/AppLayout/index';
import ProtectedRoute from '../shared/ui/ProtectedRoute';
import ComingSoon from '../shared/ui/ComingSoon';
import NotFound from '../shared/ui/NotFound';
import LoginPage from '../features/auth/pages/LoginPage';
import ScheduleCalendar from '../features/schedule/pages/ScheduleCalendar';
import MessageInbox from '../features/message/pages/MessageInbox';
import BookingDetail from '../features/booking/pages/BookingDetail';
import BookingForm from '../features/booking/pages/BookingForm';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Everything below requires a session and renders inside the app shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/schedule-calendar" replace />} />

          {/* Path kept as-is so the existing NavSider links keep working */}
          <Route path="/schedule-calendar" element={<ScheduleCalendar />} />

          <Route path="/messages" element={<MessageInbox />} />

          <Route path="/bookings/new" element={<BookingForm />} />
          <Route path="/bookings/:appointmentId" element={<BookingDetail />} />
          <Route path="/bookings/:appointmentId/edit" element={<BookingForm />} />

          {/* Sidebar sections that have no backend support yet */}
          <Route path="/dashboard" element={<ComingSoon title="Dashboard" />} />
          <Route path="/history" element={<ComingSoon title="History" />} />
          <Route path="/floor-plan" element={<ComingSoon title="Floor Plan" />} />
          <Route
            path="/service-management"
            element={<ComingSoon title="Service Management" />}
          />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
