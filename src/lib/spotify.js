import { saveTokens, logout } from '@/lib/auth';

const API_BASE = 'https://api.spotify.com/v1';
const ACCESS_TOKEN_KEY = 'spotify_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const EXPIRATION_KEY = 'spotify_token_expiration';
const REFRESH_ENDPOINT = '/api/spotify/refresh';

export function getAccessToken() {
    if (typeof window === 'undefined') {
        return null;
    }

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiration = localStorage.getItem(EXPIRATION_KEY);

    if (!accessToken || !expiration) {
        return null;
    }

    const expiresAt = Number(expiration);
    if (!Number.isFinite(expiresAt)) {
        return null;
    }

    const now = Date.now();
    if (now >= expiresAt) {
        return null;
    }

    return accessToken;
}

export async function refreshAccessToken() {
    if (typeof window === 'undefined') return null;

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
        const response = await fetch(REFRESH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            logout(); // limpiar tokens si falla refresh
            return null;
        }

        const data = await response.json();
        if (data.access_token && data.expires_in) {
            saveTokens(data.access_token, refreshToken, data.expires_in);
            return data.access_token;
        }

        return null;
    } catch (err) {
        console.error('Error refrescando token:', err);
        logout();
        return null;
    }
}

// Función para obtener token válido renovando si hace falta
export async function getValidAccessToken() {
    let token = getAccessToken();
    if (!token) {
        token = await refreshAccessToken();
    }
    return token;
}

/**
 * Genera una playlist según las preferencias seleccionadas.
 * artists: [{ id }]
 * genres: [string]
 * decades: ['1980', '1990', ...]  // [translate:año de inicio de la década]
 * popularity: [min, max]
 */
export async function generatePlaylist(preferences) {
    const { artists = [], genres = [], decades = [], popularity } = preferences;
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    let allTracks = [];

    // 1. Top tracks de artistas seleccionados
    for (const artist of artists) {
        const res = await fetch(
            `${API_BASE}/artists/${artist.id}/top-tracks?market=US`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const data = await res.json();
        if (data?.tracks) {
            allTracks.push(...data.tracks);
        }
    }

    // 2. Buscar por géneros
    for (const genre of genres) {
        const res = await fetch(
            `${API_BASE}/search?type=track&q=genre:${encodeURIComponent(
                genre
            )}&limit=20`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        const data = await res.json();
        if (data?.tracks?.items) {
            allTracks.push(...data.tracks.items);
        }
    }

    // 3. Filtrar por década
    if (decades.length > 0) {
        allTracks = allTracks.filter((track) => {
            if (!track?.album?.release_date) return false;
            const year = new Date(track.album.release_date).getFullYear();
            return decades.some((decade) => {
                const decadeStart = parseInt(decade, 10);
                return year >= decadeStart && year < decadeStart + 10;
            });
        });
    }

    // 4. Filtrar por popularidad
    if (popularity && popularity.length === 2) {
        const [min, max] = popularity;
        allTracks = allTracks.filter(
            (track) => track.popularity >= min && track.popularity <= max
        );
    }

    // 5. Eliminar duplicados y limitar a 30 canciones
    const uniqueTracks = Array.from(
        new Map(allTracks.map((track) => [track.id, track])).values()
    ).slice(0, 30);

    return uniqueTracks;
}

/**
 * Datos para ArtistWidget
 * Devuelve top artistas a partir de una lista de tracks.
 * Estructura: [{ id, name, image, genres, popularity }]
 */
export async function getArtistStatsFromTracks(tracks) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const artistMap = new Map(); // id -> { count, data }

    tracks.forEach((track) => {
        const artist = track?.artists?.[0];
        if (!artist) return;
        const id = artist.id;
        if (!id) return;

        if (!artistMap.has(id)) {
            artistMap.set(id, {
                count: 0,
                data: {
                    id,
                    name: artist.name,
                    image: null,
                    genres: [],
                    popularity: null,
                },
            });
        }
        const entry = artistMap.get(id);
        entry.count += 1;
    });

    const artistIds = Array.from(artistMap.keys());
    if (artistIds.length === 0) return [];

    const batches = [];
    const BATCH_SIZE = 50;
    for (let i = 0; i < artistIds.length; i += BATCH_SIZE) {
        const slice = artistIds.slice(i, i + BATCH_SIZE);
        const url = `${API_BASE}/artists?ids=${slice.join(',')}`;
        batches.push(
            fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            }).then((r) => r.json())
        );
    }

    const results = await Promise.all(batches);
    results.forEach((batch) => {
        (batch.artists || []).forEach((artist) => {
            const entry = artistMap.get(artist.id);
            if (!entry) return;
            entry.data.genres = artist.genres || [];
            entry.data.popularity = artist.popularity ?? null;
            entry.data.image = artist.images?.[0]?.url || null;
        });
    });

    const artists = Array.from(artistMap.values())
        .sort((a, b) => b.count - a.count)
        .map((entry) => entry.data);

    return artists;
}

/**
 * Datos para GenreWidget (géneros)
 * Devuelve [{ name, count, percentage }]
 */
export function getGenreStatsFromTracks(tracks, artistsById = {}) {
    const genreCount = new Map();
    let total = 0;

    tracks.forEach((track) => {
        const trackArtists = track.artists || [];
        trackArtists.forEach((a) => {
            const artistData = artistsById[a.id];
            const genres = artistData?.genres || [];
            genres.forEach((g) => {
                const key = g.toLowerCase();
                genreCount.set(key, (genreCount.get(key) || 0) + 1);
                total += 1;
            });
        });
    });

    const stats = Array.from(genreCount.entries()).map(([name, count]) => ({
        name,
        count,
        percentage: total ? count / total : 0,
    }));

    return stats.sort((a, b) => b.count - a.count).slice(0, 15);
}

/**
 * Datos para DecadeWidget
 * Devuelve [{ decade: '1980s', count }]
 */
export function getDecadeStatsFromTracks(tracks) {
    const decadeMap = new Map();

    tracks.forEach((track) => {
        const dateStr = track?.album?.release_date;
        if (!dateStr) return;
        const year = new Date(dateStr).getFullYear();
        if (!Number.isFinite(year)) return;

        const decadeStart = Math.floor(year / 10) * 10;
        const label = `${decadeStart}s`;
        decadeMap.set(label, (decadeMap.get(label) || 0) + 1);
    });

    const stats = Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => parseInt(a.decade) - parseInt(b.decade));

    return stats;
}

/**
 * Datos para MoodWidget
 * Usa audio features de Spotify: energy, danceability, valence, etc.
 * Devuelve { dominantMood, energy, danceability, valence }
 */
export async function getMoodSummaryFromTracks(tracks) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const trackIds = tracks.map((t) => t.id).filter(Boolean);

    if (trackIds.length === 0) return null;

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

    if (allFeatures.length === 0) return null;

    const sum = allFeatures.reduce(
        (acc, f) => {
            acc.energy += f.energy ?? 0;
            acc.danceability += f.danceability ?? 0;
            acc.valence += f.valence ?? 0;
            return acc;
        },
        { energy: 0, danceability: 0, valence: 0 }
    );

    const n = allFeatures.length;
    const energy = sum.energy / n;
    const danceability = sum.danceability / n;
    const valence = sum.valence / n;

    let dominantMood = 'desconocido';
    if (energy < 0.4 && valence < 0.4) dominantMood = 'chill / melancólico';
    else if (energy < 0.5 && valence >= 0.4) dominantMood = 'relajado';
    else if (energy >= 0.5 && valence < 0.5) dominantMood = 'intenso';
    else if (energy >= 0.5 && valence >= 0.5)
        dominantMood = 'fiestero / alegre';

    return {
        dominantMood,
        energy,
        danceability,
        valence,
    };
}

/**
 * Datos para PopularityWidget
 * Devuelve {
 *   average,
 *   min,
 *   max,
 *   histogram: [{ range: '0–20', count }]
 * }
 */
export function getPopularityStatsFromTracks(tracks) {
    const pops = tracks
        .map((t) => t.popularity)
        .filter((p) => typeof p === 'number');

    if (pops.length === 0) return null;

    const total = pops.reduce((acc, p) => acc + p, 0);
    const average = Math.round(total / pops.length);
    const min = Math.min(...pops);
    const max = Math.max(...pops);

    const buckets = [
        { label: '0–20', min: 0, max: 20 },
        { label: '21–40', min: 21, max: 40 },
        { label: '41–60', min: 41, max: 60 },
        { label: '61–80', min: 61, max: 80 },
        { label: '81–100', min: 81, max: 100 },
    ];

    const histogram = buckets.map((b) => ({
        range: b.label,
        count: pops.filter((p) => p >= b.min && p <= b.max).length,
    }));

    return {
        average,
        min,
        max,
        histogram,
    };
}

/**
 * Crea una nueva playlist en la cuenta del usuario y añade tracks.
 * name: nombre de la playlist
 * description: descripción de la playlist
 * trackUris: array de URIs de tracks (ej: spotify:track:ID)
 */
export async function createPlaylistWithTracks(name, description, trackUris) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const userRes = await fetch(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const userData = await userRes.json();

    const createRes = await fetch(
        `${API_BASE}/users/${userData.id}/playlists`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                description,
                public: false,
            }),
        }
    );
    const playlist = await createRes.json();

    const BATCH_SIZE = 100;
    for (let i = 0; i < trackUris.length; i += BATCH_SIZE) {
        const batch = trackUris.slice(i, i + BATCH_SIZE);
        await fetch(`${API_BASE}/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ uris: batch }),
        });
    }

    return playlist;
}

/**
 * Obtiene los top artistas del usuario
 * timeRange: 'short_term', 'medium_term' o 'long_term'
 * limit: número máximo de items
 */
export async function getUserTopArtists(timeRange = 'medium_term', limit = 20) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const res = await fetch(
        `${API_BASE}/me/top/artists?time_range=${timeRange}&limit=${limit}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const data = await res.json();
    return data.items || [];
}

/**
 * Obtiene los top tracks del usuario
 */
export async function getUserTopTracks(timeRange = 'medium_term', limit = 20) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const res = await fetch(
        `${API_BASE}/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const data = await res.json();
    return data.items || [];
}

/**
 * Obtiene todas las playlists del usuario
 */
export async function getUserPlaylists(limit = 50) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const res = await fetch(`${API_BASE}/me/playlists?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.items || [];
}

/**
 * Obtiene canciones guardadas (Me Gusta) del usuario
 */
export async function getUserSavedTracks(limit = 50) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const res = await fetch(`${API_BASE}/me/tracks?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return data.items.map((item) => item.track) || [];
}

/**
 * Obtiene el historial reciente de reproducciones
 */
export async function getRecentlyPlayed(limit = 50) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    const res = await fetch(
        `${API_BASE}/me/player/recently-played?limit=${limit}`,
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
    const data = await res.json();
    return data.items.map((item) => item.track) || [];
}

/**
 * Obtiene los tracks de una playlist específica
 */
export async function getPlaylistTracks(playlistId) {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No hay token válido para autenticar');

    let tracks = [];
    let url = `${API_BASE}/playlists/${playlistId}/tracks?limit=100`;

    while (url) {
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            const errorInfo = await res.json();
            console.error('Spotify API Error:', errorInfo);
            throw new Error(`Spotify API error: ${errorInfo.error.message}`);
        }

        const data = await res.json();
        tracks.push(
            ...(data.items || []).map((item) => item.track).filter(Boolean)
        );
        url = data.next;
    }

    return tracks;
}

export async function fetchUserData() {
    const token = await getValidAccessToken();
    if (!token) throw new Error('No token válido');

    const res = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
        throw new Error('Error obteniendo datos de usuario');
    }

    const data = await res.json();
    return data;
}
