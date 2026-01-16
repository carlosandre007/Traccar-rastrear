import { apiFetch } from './api';

/**
 * Traccar API Service
 * Implements main endpoints: server, devices, positions, events
 */

export const traccarService = {
    /**
     * Get Traccar server information
     */
    getServerInfo: () => apiFetch('/server'),

    /**
     * Get user session information
     */
    getSession: () => apiFetch('/session'),

    /**
     * Get list of devices
     */
    getDevices: () => apiFetch('/devices'),

    /**
     * Get current positions of devices
     */
    getPositions: () => apiFetch('/positions'),

    /**
     * Get events (optionally filtered)
     */
    getEvents: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/events?${query}`);
    },

    /**
     * Get reports (route, trips, stops, etc)
     */
    getReportRoute: (deviceId, from, to) => {
        const query = new URLSearchParams({ deviceId, from, to }).toString();
        return apiFetch(`/reports/route?${query}`);
    },
};
