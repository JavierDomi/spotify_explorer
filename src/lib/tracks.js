import { spotifyFetch, API_BASE } from './api';
import { getValidAccessToken } from './auth';

export async function getArtistTopTracks(artistId, market = 'US') {
    const data = await spotifyFetch(
        `/artists/${artistId}/top-tracks?market=${market}`
    );
    return data.tracks || [];
}

export async function searchTracksByGenre(genre, limit = 20) {
    const data = await spotifyFetch(
        `/search?type=track&q=genre:${encodeURIComponent(genre)}&limit=${limit}`
    );
    return data?.tracks?.items || [];
}

export async function getAudioFeatures(trackIds) {
    if (trackIds.length === 0) return [];

    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const BATCH_SIZE = 100;
    const allFeatures = [];

    for (let i = 0; i < trackIds.length; i += BATCH_SIZE) {
        const slice = trackIds.slice(i, i + BATCH_SIZE);
        const url = `${API_BASE}/audio-features?ids=${slice.join(',')}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.audio_features) {
            allFeatures.push(...data.audio_features.filter(Boolean));
        }
    }

    return allFeatures;
}

export async function getArtistsDetails(artistIds) {
    if (artistIds.length === 0) return [];

    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const BATCH_SIZE = 50;
    const allArtists = [];

    for (let i = 0; i < artistIds.length; i += BATCH_SIZE) {
        const slice = artistIds.slice(i, i + BATCH_SIZE);
        const url = `${API_BASE}/artists?ids=${slice.join(',')}`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        allArtists.push(...(data.artists || []));
    }

    return allArtists;
}
