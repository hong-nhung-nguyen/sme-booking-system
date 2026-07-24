import { apiRequest } from '../../../shared/api/apiClient';

export function getAppointmentsByDate(date) {
    return apiRequest(
        `/business/appointments?date=${encodeURIComponent(date)}`
    )
}
