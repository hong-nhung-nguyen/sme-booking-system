import { apiRequest } from '../../../shared/api/apiClient';

/**
 * Builds a querystring from the filters the backend accepts,
 * skipping the ones the user left empty.
 */
function buildQuery(filters = {}) {
    const params = new URLSearchParams();

    ["date", "status", "serviceId", "clientId"].forEach((key) => {
        if (filters[key]) {
            params.set(key, filters[key]);
        }
    });

    const query = params.toString();

    return query ? `?${query}` : "";
}

export function getAppointments(filters) {
    return apiRequest(`/business/appointments${buildQuery(filters)}`);
}

export function getAppointmentsByDate(date) {
    return getAppointments({ date });
}

export function getAppointment(appointmentId) {
    return apiRequest(`/business/appointments/detail/${appointmentId}`);
}

export function createAppointment(appointment) {
    return apiRequest('/business/appointments/create', {
        method: 'POST',
        body: JSON.stringify(appointment),
    });
}

export function updateAppointment(appointmentId, payload) {
    return apiRequest(`/business/appointments/edit/${appointmentId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export function deleteAppointment(appointmentId, { deleter, reason }) {
    return apiRequest(`/business/appointments/delete/${appointmentId}`, {
        method: "DELETE",
        body: JSON.stringify({ deleter, reason }),
    });
}

export function changeAppointmentStatus(appointmentId, status, payload = {}) {
    return apiRequest(
        `/business/appointments/change-status/${status}/${appointmentId}`,
        {
            method: "PATCH",
            body: JSON.stringify(payload),
        }
    );
}

export function getStatusHistory(appointmentId) {
    return apiRequest(`/business/appointments/status-history/${appointmentId}`);
}

/**
 * Services live under the location route; re-exported here so schedule code
 * has one import site. The canonical helper is in shared/api/location.api.js.
 */
export { getServices as getServicesByLocation } from '../../../shared/api/location.api';
