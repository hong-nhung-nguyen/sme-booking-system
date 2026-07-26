import { apiRequest } from '../../../shared/api/apiClient';

export function login({ email, password }) {
    return apiRequest('/auth/login', {
        method: "POST",
        body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
        })
    })
};

export function getCurrentUser() {
    return apiRequest('/auth/me');
};

export function refreshSession() {
    return apiRequest('/auth/refresh', {
        method: "POST",
        /**
         * Mark authentication operations so they cannot 
         * recursively trigger refresh
         */
        skipAuthRefresh: true
    });
};

export function logout() {
    return apiRequest('/auth/logout', {
        method: "POST",
        skipAuthRefresh: false
    })
}
