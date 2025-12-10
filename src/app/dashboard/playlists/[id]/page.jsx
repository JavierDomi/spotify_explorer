// app/dashboard/playlists/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Play,
    Clock,
    Music2,
    TrendingUp,
    Calendar,
} from 'lucide-react';
import { spotifyFetch } from '@/lib/api';
import { getPlaylistTracks } from '@/lib/playlists';
import {
    getArtistStatsFromTracks,
    getGenreStatsFromTracks,
    getDecadeStatsFromTracks,
    getPopularityStatsFromTracks,
} from '@/lib/stats';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, ExternalLink } from 'lucide-react';

export default function PlaylistDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { isFavorite, toggleFavorite } = useFavorites();

    const [playlist, setPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        async function loadPlaylistData() {
            try {
                setLoading(true);
                setError(null);

                // Cargar detalles de la playlist y tracks en paralelo
                const [playlistData, tracksData] = await Promise.all([
                    spotifyFetch(`/playlists/${id}`),
                    getPlaylistTracks(id),
                ]);

                setPlaylist(playlistData);
                setTracks(tracksData);

                // Calcular estadísticas
                if (tracksData.length > 0) {
                    const artistStats = await getArtistStatsFromTracks(
                        tracksData
                    );
                    const artistsById = {};
                    artistStats.forEach((a) => {
                        artistsById[a.id] = a;
                    });

                    const genreStats = getGenreStatsFromTracks(
                        tracksData,
                        artistsById
                    );
                    const decadeStats = getDecadeStatsFromTracks(tracksData);
                    const popularityStats =
                        getPopularityStatsFromTracks(tracksData);

                    setStats({
                        artists: artistStats,
                        genres: genreStats,
                        decades: decadeStats,
                        popularity: popularityStats,
                    });
                }
            } catch (e) {
                console.error('Error loading playlist:', e);
                setError(
                    'No se pudo cargar la playlist. Por favor, intenta de nuevo.'
                );
            } finally {
                setLoading(false);
            }
        }

        loadPlaylistData();
    }, [id]);

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    const getTotalDuration = () => {
        const totalMs = tracks.reduce(
            (acc, track) => acc + (track.duration_ms || 0),
            0
        );
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-zinc-400">Cargando playlist...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="glass-card p-8 max-w-md text-center">
                    <Music2 className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p className="text-zinc-400 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg transition"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    if (!playlist) return null;

    return (
        <div className="space-y-6">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition"
            >
                <ArrowLeft className="w-5 h-5" />
                Volver a playlists
            </button>

            {/* Hero Section */}
            <div className="glass-card p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Cover Image */}
                    <div className="flex-shrink-0">
                        {playlist.images?.[0] ? (
                            <img
                                src={playlist.images[0].url}
                                alt={playlist.name}
                                className="w-48 h-48 md:w-64 md:h-64 rounded-xl shadow-2xl"
                            />
                        ) : (
                            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-zinc-800 flex items-center justify-center">
                                <Music2 className="w-24 h-24 text-zinc-600" />
                            </div>
                        )}
                    </div>

                    {/* Playlist Info */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                                Playlist
                            </p>
                            <h1 className="text-3xl md:text-4xl font-bold mb-3">
                                {playlist.name}
                            </h1>
                            {playlist.description && (
                                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                                    {playlist.description}
                                </p>
                            )}

                            {/* Metadata */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={
                                            playlist.owner?.images?.[0]?.url ||
                                            '/default-avatar.png'
                                        }
                                        alt={playlist.owner?.display_name}
                                        className="w-6 h-6 rounded-full"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                    <span className="font-medium text-zinc-200">
                                        {playlist.owner?.display_name}
                                    </span>
                                </div>
                                <span>•</span>
                                <span>{tracks.length} canciones</span>
                                <span>•</span>
                                <span>{getTotalDuration()}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6">
                            <a
                                href={playlist.external_urls?.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 rounded-full 
                                         font-semibold transition flex items-center gap-2"
                            >
                                <Play className="w-5 h-5" fill="currentColor" />
                                Abrir en Spotify
                            </a>
                            <a
                                href={playlist.external_urls?.spotify}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 glass-card hover:bg-zinc-800/50 rounded-full transition"
                                title="Abrir en nueva pestaña"
                            >
                                <ExternalLink className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Tracks */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500/20 rounded-lg">
                                <Music2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {tracks.length}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Canciones
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Artists */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.artists.length}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Artistas
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-500/20 rounded-lg">
                                <Clock className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {getTotalDuration()}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Duración
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Popularity */}
                    <div className="glass-card p-5">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">
                                    {stats.popularity?.average || 0}
                                </p>
                                <p className="text-xs text-zinc-400">
                                    Popularidad
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracks List */}
            <div className="glass-card">
                <div className="p-4 border-b border-zinc-800/50">
                    <h3 className="text-lg font-semibold">Canciones</h3>
                </div>

                <div className="divide-y divide-zinc-800/30">
                    {tracks.map((track, index) => {
                        const favorite = isFavorite(track.id);

                        return (
                            <div
                                key={track.id}
                                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 
                                         transition-colors group"
                            >
                                {/* Number */}
                                <span className="text-zinc-500 text-sm font-mono w-8 text-right">
                                    {index + 1}
                                </span>

                                {/* Album Cover */}
                                {track.album?.images?.[0] && (
                                    <img
                                        src={track.album.images[0].url}
                                        alt={track.name}
                                        className="w-12 h-12 rounded"
                                    />
                                )}

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-zinc-200 truncate">
                                        {track.name}
                                    </p>
                                    <p className="text-xs text-zinc-400 truncate">
                                        {track.artists
                                            ?.map((a) => a.name)
                                            .join(', ')}
                                    </p>
                                </div>

                                {/* Album */}
                                <div className="hidden md:block flex-1 min-w-0">
                                    <p className="text-xs text-zinc-400 truncate">
                                        {track.album?.name}
                                    </p>
                                </div>

                                {/* Actions & Duration */}
                                <div className="flex items-center gap-3">
                                    {/* Favorite */}
                                    <button
                                        onClick={() => toggleFavorite(track)}
                                        className={`
                                            opacity-0 group-hover:opacity-100 transition-all p-2 rounded-lg
                                            ${
                                                favorite
                                                    ? 'text-red-500 bg-red-500/10 opacity-100'
                                                    : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                                            }
                                        `}
                                    >
                                        <Heart
                                            className="w-4 h-4"
                                            fill={
                                                favorite
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    </button>

                                    {/* Popularity */}
                                    <span
                                        className={`
                                        hidden sm:block px-2 py-1 rounded text-[10px] font-medium
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

                                    {/* Duration */}
                                    <span className="text-xs text-zinc-500 w-12 text-right">
                                        {formatDuration(track.duration_ms)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Top Artists & Genres */}
            {stats && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Artists */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-4">
                            Top Artistas
                        </h3>
                        <div className="space-y-3">
                            {stats.artists.slice(0, 5).map((artist, index) => (
                                <div
                                    key={artist.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 transition"
                                >
                                    <span className="text-zinc-500 text-sm w-6">
                                        {index + 1}
                                    </span>
                                    {artist.image && (
                                        <img
                                            src={artist.image}
                                            alt={artist.name}
                                            className="w-10 h-10 rounded-full"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {artist.name}
                                        </p>
                                        <p className="text-xs text-zinc-400">
                                            {artist.genres
                                                ?.slice(0, 2)
                                                .join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Genres */}
                    <div className="glass-card p-5">
                        <h3 className="text-sm font-semibold mb-4">
                            Géneros Principales
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {stats.genres.slice(0, 10).map((genre) => (
                                <span
                                    key={genre.name}
                                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 
                                             rounded-full text-xs font-medium"
                                >
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
