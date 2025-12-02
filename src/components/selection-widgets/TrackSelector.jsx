'use client';

import { useState, useEffect } from 'react';
import { Search, X, Music } from 'lucide-react';

/**
 * TrackSelector - Widget interactivo para buscar y seleccionar canciones
 *
 * @param {Function} onSelect - Callback cuando cambian las tracks seleccionadas
 * @param {Array} selectedTracks - Array de tracks ya seleccionadas
 * @param {Number} maxTracks - Límite máximo de tracks (default: 10)
 */
export default function TrackSelector({
    onSelect,
    selectedTracks = [],
    maxTracks = 10,
}) {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debouncing: Esperar 500ms después de que el usuario deje de escribir
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    // Buscar cuando cambie el query debounced
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setResults([]);
            setError(null);
            return;
        }

        searchTracks(debouncedQuery);
    }, [debouncedQuery]);

    const searchTracks = async (searchQuery) => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('spotify_token');

            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            const encodedQuery = encodeURIComponent(searchQuery);
            const res = await fetch(
                `https://api.spotify.com/v1/search?type=track&q=${encodedQuery}&limit=20`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                if (res.status === 401) {
                    throw new Error(
                        'Token expirado. Por favor, vuelve a iniciar sesión.'
                    );
                }
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            setResults(data.tracks?.items || []);
        } catch (err) {
            console.error('Error buscando tracks:', err);
            setError(err.message);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleTrack = (track) => {
        const isSelected = selectedTracks.some((t) => t.id === track.id);

        if (isSelected) {
            // Remover track
            onSelect(selectedTracks.filter((t) => t.id !== track.id));
        } else {
            // Añadir track si no se ha alcanzado el límite
            if (selectedTracks.length < maxTracks) {
                onSelect([...selectedTracks, track]);
            }
        }
    };

    const removeTrack = (trackId) => {
        onSelect(selectedTracks.filter((t) => t.id !== trackId));
    };

    const clearSelection = () => {
        onSelect([]);
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    const isTrackSelected = (trackId) => {
        return selectedTracks.some((t) => t.id === trackId);
    };

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                        Buscar Canciones
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        Selecciona hasta {maxTracks} canciones
                    </p>
                </div>
                {selectedTracks.length > 0 && (
                    <span className="text-xs text-emerald-400 font-medium">
                        {selectedTracks.length}/{maxTracks}
                    </span>
                )}
            </header>

            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Busca por título, artista, álbum..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 
                             text-sm text-zinc-200 placeholder-zinc-500
                             focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
                             transition-all"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 
                                 hover:text-zinc-200 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Selected Tracks */}
            {selectedTracks.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-300">
                            Seleccionadas
                        </span>
                        <button
                            onClick={clearSelection}
                            className="text-[11px] text-zinc-400 hover:text-red-400 transition"
                        >
                            Limpiar todo
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {selectedTracks.map((track) => (
                            <div
                                key={track.id}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full 
                                         bg-emerald-500/20 border border-emerald-500/30 
                                         group hover:bg-emerald-500/30 transition"
                            >
                                <span className="text-xs text-emerald-300 truncate max-w-[120px]">
                                    {track.name}
                                </span>
                                <button
                                    onClick={() => removeTrack(track.id)}
                                    className="text-emerald-400 hover:text-red-400 transition"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="flex flex-col items-center gap-2">
                        <div
                            className="w-6 h-6 border-2 border-emerald-500 border-t-transparent 
                                      rounded-full animate-spin"
                        />
                        <span className="text-xs text-zinc-400">
                            Buscando...
                        </span>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            {/* Empty State */}
            {!loading &&
                !error &&
                query &&
                results.length === 0 &&
                debouncedQuery === query && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Music className="w-10 h-10 text-zinc-600 mb-2" />
                        <p className="text-xs text-zinc-400">
                            No se encontraron canciones para "{query}"
                        </p>
                    </div>
                )}

            {/* Search Results */}
            {!loading && results.length > 0 && (
                <div className="space-y-1 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {results.map((track) => {
                        const selected = isTrackSelected(track.id);
                        const atLimit =
                            selectedTracks.length >= maxTracks && !selected;

                        return (
                            <button
                                key={track.id}
                                onClick={() => !atLimit && toggleTrack(track)}
                                disabled={atLimit}
                                className={`
                                    w-full flex items-center gap-3 p-2 rounded-lg
                                    transition-all text-left
                                    ${
                                        selected
                                            ? 'bg-emerald-500/20 border border-emerald-500/40'
                                            : 'hover:bg-zinc-800/50 border border-transparent'
                                    }
                                    ${
                                        atLimit
                                            ? 'opacity-40 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }
                                `}
                            >
                                {/* Album Cover */}
                                <div className="relative flex-shrink-0">
                                    {track.album?.images?.[0] ? (
                                        <img
                                            src={track.album.images[0].url}
                                            alt={track.name}
                                            className="w-10 h-10 rounded"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center">
                                            <Music className="w-5 h-5 text-zinc-600" />
                                        </div>
                                    )}

                                    {/* Selected Indicator */}
                                    {selected && (
                                        <div
                                            className="absolute -top-1 -right-1 w-4 h-4 
                                                      bg-emerald-500 rounded-full flex items-center justify-center"
                                        >
                                            <svg
                                                className="w-3 h-3 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={3}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`
                                        text-xs font-medium truncate
                                        ${
                                            selected
                                                ? 'text-emerald-300'
                                                : 'text-zinc-200'
                                        }
                                    `}
                                    >
                                        {track.name}
                                    </p>
                                    <p className="text-[11px] text-zinc-400 truncate">
                                        {track.artists
                                            ?.map((a) => a.name)
                                            .join(', ')}
                                    </p>
                                </div>

                                {/* Duration & Popularity */}
                                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                    <span className="text-[11px] text-zinc-500">
                                        {formatDuration(track.duration_ms)}
                                    </span>
                                    {track.popularity > 0 && (
                                        <span
                                            className={`
                                            text-[10px] px-1.5 py-0.5 rounded
                                            ${
                                                track.popularity >= 70
                                                    ? 'bg-green-500/20 text-green-400'
                                                    : track.popularity >= 40
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-zinc-500/20 text-zinc-400'
                                            }
                                        `}
                                        >
                                            {track.popularity}
                                        </span>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Hint Text */}
            {!query && selectedTracks.length === 0 && (
                <div className="text-center py-6">
                    <Music className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                    <p className="text-xs text-zinc-500">
                        Escribe para buscar tus canciones favoritas
                    </p>
                </div>
            )}
        </section>
    );
}
