import { getValidAccessToken } from './auth';

export const API_BASE = 'https://api.spotify.com/v1';

export async function spotifyFetch(endpoint, options = {}) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const url = endpoint.startsWith('http')
        ? endpoint
        : `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new Error(
            errorInfo?.error?.message || `Spotify API error: ${response.status}`
        );
    }

    return response.json();
}

export async function spotifyFetchAll(endpoint, itemsKey = 'items') {
    let allItems = [];
    let url = `${API_BASE}${endpoint}`;

    while (url) {
        const data = await spotifyFetch(url);
        allItems.push(...(data[itemsKey] || []));
        url = data.next;
    }

    return allItems;
}
