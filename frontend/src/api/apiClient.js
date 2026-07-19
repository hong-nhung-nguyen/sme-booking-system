// Reusable helper for sending requests from frontend to backend API

const API_BASE_URL = "/api/v1";

export async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        /**
         * Tells fetch() to send cookies with the request and accept cookies returned by the backend
         * Allows the browser to receive and send the backend's HTTP-only authentication cookies 
         */
        credentials: "include",
        ...options,
        headers: {
            "Content-type": "application/json",
            ...options.headers,
        }
    });

    // const contentType = response.headers.get("Content-type") [HTTP header names are case-insensitive]
    const contentType = response.headers.get('content-type');

    const data = contentType?.includes("application/json")
        ? await response.json()
        : null
    
    if (!response.ok) {
        const error = new Error (
            data?.message || `Request failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;
}