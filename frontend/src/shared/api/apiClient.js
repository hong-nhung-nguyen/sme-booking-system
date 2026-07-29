const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export const AUTH_EXPIRED_EVENT = "auth:expired";

let refreshPromise = null;

async function sendRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        ...options,
        headers: {
            "Content-type": "application/json",
            ...options.headers,
        }
    });

    const contentType = response.headers.get('content-type');

    const data = contentType?.includes("application/json")
        ? await response.json()
        : null

    return {
        response,
        data
    };
};

async function refreshAccessToken() {
    if (!refreshPromise) {
        refreshPromise = sendRequest("/auth/refresh", {
            method: "POST"
        })
            .then(({ response, data }) => {
                if (!response.ok) {
                    const error = new Error(
                        data?.message || "Your session has expired"
                    );

                    error.status = response.status;
                    error.data = data;

                    throw error;
                }
            })
            .finally(() => {
                refreshPromise = null;
            })
    }

    return refreshPromise;
}

export async function apiRequest(path, options = {}) {
    const {
        skipAuthRefresh = false,
        ...fetchOptions
    } = options;

    let { response, data } = await sendRequest(path, fetchOptions);

    /*
     * A 401 means the access token is missing or expired.
     * Refresh once, then retry the original request.
    */
    if (response.status === 401 && !skipAuthRefresh) {
        try {
            await refreshAccessToken();

            ({ response, data } = await sendRequest(path, fetchOptions));
        } catch (refreshError) {
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));

            throw refreshError;
        }
    }

    if (!response.ok) {
        const error = new Error(
            data?.message || `Request failed with status ${response.status}`
        );

        error.status = response.status;
        error.data = data;

        throw error;
    }

    return data;

}
