import { apiRequest } from "./apiClient";

export function getAppointmentsByDate(date) {
    return apiRequest(
        `/business/appointments?date=${encodeURIComponent(date)}`
    )
}