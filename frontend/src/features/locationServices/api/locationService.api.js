import { apiRequest } from "../../../shared/api/apiClient";

export function getLocationServices(locationId) {
    return apiRequest(`/business/locations/${encodeURIComponent(locationId)}/services`);
};

export function getBusinessServices() {
    return apiRequest("/business/services");
};

export function assignLocationServices(locationId, serviceIds) {
    return apiRequest(
        `/business/locations/${encodeURIComponent(locationId)}/services`,
        {
            method: "PUT",
            body: JSON.stringify({ serviceIds })
        }
    );
};

export function createAndAssignLocationServices(locationId, newService) {
    return apiRequest(
        `/business/locations/${encodeURIComponent(locationId)}/service`,
        {
            method: "POST",
            body: JSON.stringify({ newService })
        }
    );
};

export function unassignLocationService(locationId, serviceId) {
    return apiRequest( 
        `/business/locations/${encodeURIComponent(locationId)}/services/${encodeURIComponent(serviceId)}`,
        {
            method: "DELETE"
        }
    );
};

export function updateLocationServiceStatus(locationId, serviceId, status) {
    return apiRequest(
        `/business/locations/${encodeURIComponent(locationId)}/services/${encodeURIComponent(serviceId)}/status`,
        {
            method: "PATCH",
            body: JSON.stringify({ status })
        }
    );
};

export function editCanonicalService(serviceId, input) {
    return apiRequest(
        `/business/services/edit/${encodeURIComponent(serviceId)}`,
        {
            method: "PATCH",
            body: JSON.stringify(input)
        }
    );
};



