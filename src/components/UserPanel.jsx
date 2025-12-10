'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { getValidAccessToken } from '@/lib/index';

// Icons
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyIcon from '@mui/icons-material/Key';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import EmailIcon from '@mui/icons-material/Email';
import PublicIcon from '@mui/icons-material/Public';
import StarIcon from '@mui/icons-material/Star';
import PeopleIcon from '@mui/icons-material/People';
import LinkIcon from '@mui/icons-material/Link';

export default function UserPanel() {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showTokens, setShowTokens] = useState(false);
    const [tokens, setTokens] = useState({ accessToken: '', refreshToken: '' });
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(null);
    const panelRef = useRef(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchUser() {
            try {
                const token = await getValidAccessToken();

                if (!token) {
                    logout();
                    router.push('/');
                    return;
                }

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
    }, [router]);

    // Cerrar panel al hacer clic fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleLogout = () => {
        logout();
        setUser(null);
        setTokens({ accessToken: '', refreshToken: '' });
        router.push('/'); // redirección explícita al hacer logout
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (error && !user) {
        return (
            <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-zinc-900/95 backdrop-blur-sm border border-red-500/30 p-3 rounded-xl shadow-lg">
                    <p className="text-red-400 text-sm mb-2">Error: {error}</p>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-red-600 py-2 text-sm font-semibold hover:bg-red-700 transition-colors"
                    >
                        <LogoutIcon fontSize="small" />
                        Cerrar sesión
                    </button>
                </div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="absolute bottom-4 left-4 right-4" ref={panelRef}>
            {/* Barra compacta - siempre visible */}
            <div className="bg-zinc-900/95 backdrop-blur-sm border border-zinc-800/50 rounded-xl shadow-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-zinc-200 truncate max-w-[140px]">
                            {user.display_name || 'Usuario'}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-1.5 rounded-lg transition-all duration-200 ${
                            isOpen
                                ? 'bg-green-500/20 text-green-400 rotate-90'
                                : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <SettingsIcon fontSize="small" />
                    </button>
                </div>
            </div>

            {/* Panel desplegable grande */}
            {isOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-zinc-900/98 backdrop-blur-md border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
                    {/* Header del panel */}
                    <div className="relative bg-gradient-to-r from-green-500/10 to-blue-500/10 p-5 border-b border-zinc-800/50">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 p-1 rounded-lg hover:bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <CloseIcon fontSize="small" />
                        </button>

                        <div className="flex items-center gap-4">
                            {user.images?.[0]?.url ? (
                                <img
                                    src={user.images[0].url}
                                    alt={user.display_name || 'Usuario'}
                                    className="w-16 h-16 rounded-full object-cover ring-3 ring-green-500/30 shadow-lg"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center ring-3 ring-green-500/30">
                                    <PersonIcon
                                        className="text-zinc-400"
                                        sx={{ fontSize: 32 }}
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-bold text-zinc-100">
                                    {user.display_name || 'Usuario'}
                                </h3>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full mt-1 ${
                                        user.product === 'premium'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-zinc-700 text-zinc-400'
                                    }`}
                                >
                                    <StarIcon sx={{ fontSize: 12 }} />
                                    {user.product === 'premium'
                                        ? 'Premium'
                                        : 'Free'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información del usuario */}
                    <div className="p-4 space-y-3">
                        <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            Información de la cuenta
                        </h4>

                        <div className="grid gap-2">
                            <div className="flex items-center gap-3 p-2.5 bg-zinc-800/30 rounded-lg">
                                <EmailIcon
                                    className="text-zinc-500"
                                    sx={{ fontSize: 18 }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-zinc-500">
                                        Email
                                    </p>
                                    <p className="text-sm text-zinc-200 truncate">
                                        {user.email || 'No disponible'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 bg-zinc-800/30 rounded-lg">
                                <PublicIcon
                                    className="text-zinc-500"
                                    sx={{ fontSize: 18 }}
                                />
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500">
                                        País
                                    </p>
                                    <p className="text-sm text-zinc-200">
                                        {user.country || 'No disponible'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 bg-zinc-800/30 rounded-lg">
                                <PeopleIcon
                                    className="text-zinc-500"
                                    sx={{ fontSize: 18 }}
                                />
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500">
                                        Seguidores
                                    </p>
                                    <p className="text-sm text-zinc-200">
                                        {user.followers?.total?.toLocaleString() ||
                                            '0'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-2.5 bg-zinc-800/30 rounded-lg">
                                <LinkIcon
                                    className="text-zinc-500"
                                    sx={{ fontSize: 18 }}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-zinc-500">
                                        ID de Spotify
                                    </p>
                                    <p className="text-sm text-zinc-200 truncate font-mono">
                                        {user.id || 'N/D'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sección de tokens (colapsable) */}
                    <div className="px-4 pb-4">
                        <button
                            onClick={() => setShowTokens(!showTokens)}
                            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors mb-2"
                        >
                            <KeyIcon sx={{ fontSize: 14 }} />
                            <span>
                                {showTokens
                                    ? 'Ocultar tokens'
                                    : 'Mostrar tokens (desarrollo)'}
                            </span>
                        </button>

                        {showTokens && (
                            <div className="space-y-2 mt-2">
                                <div className="bg-zinc-800/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-zinc-500">
                                            Access Token
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    tokens.accessToken,
                                                    'access'
                                                )
                                            }
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <ContentCopyIcon
                                                sx={{ fontSize: 14 }}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-zinc-400 truncate">
                                        {tokens.accessToken
                                            ? `${tokens.accessToken.slice(
                                                  0,
                                                  30
                                              )}...`
                                            : 'N/D'}
                                    </p>
                                    {copied === 'access' && (
                                        <span className="text-xs text-green-400">
                                            ¡Copiado!
                                        </span>
                                    )}
                                </div>
                                <div className="bg-zinc-800/50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-zinc-500">
                                            Refresh Token
                                        </span>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(
                                                    tokens.refreshToken,
                                                    'refresh'
                                                )
                                            }
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <ContentCopyIcon
                                                sx={{ fontSize: 14 }}
                                            />
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-zinc-400 truncate">
                                        {tokens.refreshToken
                                            ? `${tokens.refreshToken.slice(
                                                  0,
                                                  30
                                              )}...`
                                            : 'N/D'}
                                    </p>
                                    {copied === 'refresh' && (
                                        <span className="text-xs text-green-400">
                                            ¡Copiado!
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-amber-500/80">
                                    ⚠️ No compartas estos tokens con nadie
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Botón de logout */}
                    <div className="p-4 border-t border-zinc-800/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600/10 border border-red-600/20 py-3 text-sm font-semibold text-red-400 hover:bg-red-600/20 hover:border-red-600/40 transition-all"
                        >
                            <LogoutIcon fontSize="small" />
                            Cerrar sesión
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
