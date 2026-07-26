import { apiRequest } from '../../../shared/api/apiClient';

export function getAppointmentsByDate(date) {
    return apiRequest(
        `/business/appointments?date=${encodeURIComponent(date)}`
    )
}

export function createAppointment(appointment) {
    return apiRequest('/business/appointments/create', {
        method: 'POST',
        body: JSON.stringify(appointment),
    });
}

export function getServicesByLocation(locationId) {
  return apiRequest(`/business/locations/${locationId}/services`);
}
