/**
 * Base API Service
 * Handles base URL and authentication headers
 */

const BASE_URL = import.meta.env.VITE_TRACCAR_API_URL || '';

export const apiFetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `/api${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || `API Error: ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
};
