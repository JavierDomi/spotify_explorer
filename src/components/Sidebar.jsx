'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getValidAccessToken } from '@/lib/spotify';
import { logout } from '@/lib/auth';

import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';

const menuItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        description: 'Resumen general',
    },
    {
        href: '/dashboard/mixer',
        label: 'Mixer',
        icon: <QueueMusicIcon />,
    },
    {
        href: '/dashboard/my-top',
        label: 'Mis Tops',
        icon: <EmojiEventsIcon />,
        description: 'Artistas y tracks favoritos',
    },
    {
        href: '/dashboard/playlists',
        label: 'Playlists',
        icon: <QueueMusicIcon />,
        description: 'Todas tus playlists',
    },
    {
        href: '/dashboard/saved',
        label: 'Me Gusta',
        icon: <FavoriteIcon />,
        description: 'Canciones guardadas',
    },
    {
        href: '/dashboard/recent',
        label: 'Recientes',
        icon: <HistoryIcon />,
        description: 'Historial de reproducción',
    },
];

// Componente UserPanel para mostrar foto, nombre, tokens y logout
function UserPanel() {
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

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:flex-col md:w-72 glass-card rounded-none border-r border-zinc-800/50 relative">
            {/* Header */}
            <div className="px-6 py-8 border-b border-zinc-800/50">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Spotify Mixer
                </h1>
                <p className="mt-2 text-xs text-zinc-400">
                    Analiza y mezcla tu música favorita
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                group flex items-start gap-3 px-4 py-3 rounded-xl
                text-sm font-medium transition-all duration-200
                ${
                    isActive
                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 shadow-lg shadow-green-500/10 border border-green-500/20'
                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                }
              `}
                        >
                            <span className="text-2xl mt-0.5">{item.icon}</span>
                            <div className="flex-1">
                                <div
                                    className={`font-semibold ${
                                        isActive
                                            ? 'text-green-400'
                                            : 'text-zinc-300'
                                    }`}
                                >
                                    {item.label}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                    {item.description}
                                </div>
                            </div>
                            {isActive && (
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-2"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-zinc-400">Conectado a Spotify</span>
                </div>
            </div>

            {/* UserPanel fijo abajo a la izquierda */}
            <UserPanel />
        </aside>
    );
}
