import { spotifyFetch } from './api';

export async function fetchUserData() {
    return spotifyFetch('/me');
}

export async function getUserTopArtists(timeRange = 'medium_term', limit = 20) {
    const data = await spotifyFetch(
        `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    return data.items || [];
}

export async function getUserTopTracks(timeRange = 'medium_term', limit = 20) {
    const data = await spotifyFetch(
        `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
    return data.items || [];
}

export async function getRecentlyPlayed(limit = 50) {
    const data = await spotifyFetch(
        `/me/player/recently-played?limit=${limit}`
    );
    return (data.items || []).map((item) => item.track);
}

export async function getUserSavedTracks(limit = 50) {
    const data = await spotifyFetch(`/me/tracks?limit=${limit}`);
    return (data.items || []).map((item) => item.track);
}
