// /lib/auth.js

const ACCESS_TOKEN_KEY = 'spotify_token';
const REFRESH_TOKEN_KEY = 'spotify_refresh_token';
const EXPIRATION_KEY = 'spotify_token_expiration';
const AUTH_STATE_KEY = 'spotify_auth_state';
const REFRESH_ENDPOINT = '/api/spotify/refresh';

// Utilidades
export function generateRandomString(length) {
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// OAuth
export function getSpotifyAuthUrl() {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || '';
    const state = generateRandomString(16);

    if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STATE_KEY, state);
    }

    const scope = [
        'ugc-image-upload',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'streaming',
        'app-remote-control',
        'user-read-email',
        'user-read-private',
        'playlist-read-collaborative',
        'playlist-modify-public',
        'playlist-read-private',
        'playlist-modify-private',
        'user-library-modify',
        'user-library-read',
        'user-top-read',
        'user-read-playback-position',
        'user-read-recently-played',
        'user-follow-read',
        'user-follow-modify',
    ].join(' ');

    const params = new URLSearchParams({
        client_id: clientId,
        response_type: 'code',
        redirect_uri: redirectUri,
        state: state,
        scope: scope,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Gestión de tokens
export function saveTokens(accessToken, refreshToken, expiresIn) {
    if (typeof window === 'undefined') return;

    const expirationTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(EXPIRATION_KEY, expirationTime.toString());
}

export function getAccessToken() {
    if (typeof window === 'undefined') return null;

    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiration = localStorage.getItem(EXPIRATION_KEY);

    if (!accessToken || !expiration) return null;

    const expiresAt = Number(expiration);
    if (!Number.isFinite(expiresAt)) return null;

    if (Date.now() >= expiresAt) return null;

    return accessToken;
}

export function getRefreshToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function refreshAccessToken() {
    if (typeof window === 'undefined') return null;

    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(REFRESH_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            // refresh token inválido/cado
            logout();
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

export async function getValidAccessToken() {
    let token = getAccessToken();
    if (!token) {
        token = await refreshAccessToken();
    }
    return token;
}

// Estado de sesión
export function isAuthenticated() {
    return getAccessToken() !== null;
}

export function logout() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
    localStorage.removeItem(AUTH_STATE_KEY);
}

export function getStoredAuthState() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(AUTH_STATE_KEY);
}

export function clearAuthState() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STATE_KEY);
}
