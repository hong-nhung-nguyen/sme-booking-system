import { apiRequest } from "./apiClient";

// The locations the signed-in user is allowed to work with
export function getLocations() {
    return apiRequest("/business/locations");
}

// Services offered at a specific location (price may be overridden per location)
export function getServices(locationId) {
    return apiRequest(
        `/business/locations/${encodeURIComponent(locationId)}/services`
    );
}
