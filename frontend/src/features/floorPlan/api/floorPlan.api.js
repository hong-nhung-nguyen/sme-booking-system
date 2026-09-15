import { apiRequest } from "../../../shared/api/apiClient";

export async function getFloorPlan(locationId) {
    const response = await apiRequest(`/business/locations/${encodeURIComponent(locationId)}/floorplans`);

    // status 200 + floorPlan: null if no layout exists
    if (!response || !Object.hasOwn(response, "floorPlan")) {
        throw new Error("The server returned an invalid floor-plan response");
    }

    return response.floorPlan;
};



