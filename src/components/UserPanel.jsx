'use client';

import { useState, useEffect } from 'react';
import { getValidAccessToken, logout } from '@/lib/auth';

export default function UserPanel() {
    const [user, setUser] = useState(null);
    const [showTokens, setShowTokens] = useState(false);
    const [tokens, setTokens] = useState({ accessToken: '', refreshToken: '' });
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const token = await getValidAccessToken();
                if (!token) throw new Error('No hay token válido');

                const res = await fetch('https://api.spotify.com/v1/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('No se pudo obtener usuario');

                const data = await res.json();
                setUser(data);

                setTokens({
                    accessToken: localStorage.getItem('spotify_token') || '',
                    refreshToken:
                        localStorage.getItem('spotify_refresh_token') || '',
                });
                setError(null);
            } catch (err) {
                setError(err.message);
                setUser(null);
            }
        }
        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        setUser(null);
        setTokens({ accessToken: '', refreshToken: '' });
    };

    if (!user) {
        if (error) {
            return (
                <div className="fixed bottom-4 left-4 w-64 bg-zinc-900 p-4 rounded shadow-lg text-zinc-200 text-sm font-sans">
                    <p>Error: {error}</p>
                    <button
                        onClick={handleLogout}
                        className="mt-2 w-full rounded bg-red-600 py-1 font-semibold hover:bg-red-700"
                    >
                        Cerrar sesión
                    </button>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 w-64 bg-zinc-900 p-4 rounded shadow-lg text-zinc-200 font-sans">
            <div className="flex items-center gap-3 mb-4">
                {user.images?.[0]?.url && (
                    <img
                        src={user.images[0].url}
                        alt={user.display_name || 'Usuario Spotify'}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                )}
                <div>
                    <p className="font-semibold text-lg truncate max-w-[150px]">
                        {user.display_name || 'Usuario Spotify'}
                    </p>
                    <p className="text-xs text-zinc-400 truncate max-w-[150px]">
                        {user.email || ''}
                    </p>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full mb-4 rounded bg-red-600 hover:bg-red-700 py-2 font-semibold"
            >
                Cerrar sesión
            </button>

            <div className="mb-2 text-xs text-zinc-400">
                <span className="font-semibold">Tokens (no compartir):</span>
            </div>
            <button
                onClick={() => setShowTokens(!showTokens)}
                className="text-xs underline mb-2"
            >
                {showTokens ? 'Ocultar' : 'Mostrar'}
            </button>
            {showTokens && (
                <div className="bg-zinc-800 rounded p-2 max-h-24 overflow-auto text-xs break-all font-mono">
                    <p>
                        <strong>Access Token:</strong>{' '}
                        {tokens.accessToken || 'N/D'}
                    </p>
                    <p>
                        <strong>Refresh Token:</strong>{' '}
                        {tokens.refreshToken || 'N/D'}
                    </p>
                </div>
            )}
        </div>
    );
}
