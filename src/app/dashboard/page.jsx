'use client';

import { useEffect, useState } from 'react';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import TracksListWidget from '@/components/widgets/TracksListWidget';

import {
    getUserTopArtists,
    getUserTopTracks,
    getRecentlyPlayed,
    getUserSavedTracks,
    getArtistStatsFromTracks,
    getGenreStatsFromTracks,
    getDecadeStatsFromTracks,
    getMoodSummaryFromTracks,
    getPopularityStatsFromTracks,
    createPlaylistWithTracks,
} from '@/lib/spotify';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [decades, setDecades] = useState([]);
    const [mood, setMood] = useState(null);
    const [popularity, setPopularity] = useState(null);
    const [saving, setSaving] = useState(false);
    const [userStats, setUserStats] = useState(null);

    async function load() {
        try {
            setLoading(true);
            setError(null);

            // 1. Obtener datos reales del usuario (paralelo para mejor performance)
            const [topArtists, topTracks, recentlyPlayed, savedTracks] =
                await Promise.all([
                    getUserTopArtists('medium_term', 50),
                    getUserTopTracks('medium_term', 50),
                    getRecentlyPlayed(50),
                    getUserSavedTracks(50),
                ]);

            // 2. Combinar todos los tracks del usuario (top + recent + saved)
            const allUserTracks = [
                ...topTracks.map((t) => ({ ...t, source: 'top' })),
                ...recentlyPlayed.map((t) => ({ ...t, source: 'recent' })),
                ...savedTracks.map((t) => ({ ...t, source: 'saved' })),
            ];

            // Eliminar duplicados manteniendo el primero encontrado
            const uniqueTracks = Array.from(
                new Map(allUserTracks.map((t) => [t.id, t])).values()
            ).slice(0, 100); // Limitar a 100 para performance

            setTracks(uniqueTracks);
            setUserStats({
                topArtistsCount: topArtists.length,
                totalTracksAnalyzed: uniqueTracks.length,
                sources: {
                    top: topTracks.length,
                    recent: recentlyPlayed.length,
                    saved: savedTracks.length,
                },
            });

            // 3. Generar estadísticas desde los tracks reales del usuario
            const artistsForWidget = await getArtistStatsFromTracks(
                uniqueTracks
            );
            const artistsById = {};
            artistsForWidget.forEach((a) => {
                artistsById[a.id] = a;
            });

            const genreStats = getGenreStatsFromTracks(
                uniqueTracks,
                artistsById
            );
            const decadeStats = getDecadeStatsFromTracks(uniqueTracks);
            const moodSummary = await getMoodSummaryFromTracks(uniqueTracks);
            const popularityStats = getPopularityStatsFromTracks(uniqueTracks);

            setArtists(artistsForWidget);
            setGenres(genreStats);
            setDecades(decadeStats);
            setMood(moodSummary);
            setPopularity(popularityStats);
        } catch (err) {
            console.error(err);
            setError(
                'No se pudieron cargar tus datos de Spotify. Verifica tu conexión.'
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const handleSavePlaylist = async () => {
        try {
            setSaving(true);
            const trackUris = tracks
                .slice(0, 50)
                .map((t) => `spotify:track:${t.id}`);
            const date = new Date().toLocaleDateString('es-ES');

            await createPlaylistWithTracks(
                `Mi Perfil Spotify - ${date}`,
                'Análisis automático de tu historial de Spotify',
                trackUris
            );

            alert('¡Playlist de tu perfil guardada en Spotify!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la playlist');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = () => {
        load();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-zinc-300">
                        Analizando tu perfil de Spotify...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-card border-red-500/40 bg-red-950/40 p-6 text-center">
                <p className="text-red-200 mb-4">{error}</p>
                <button
                    onClick={handleRegenerate}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Tu Perfil de Spotify
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Analizado con {tracks.length} canciones únicas de tu
                        historial
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSavePlaylist}
                        disabled={saving}
                        className="glass-card px-5 py-2.5 text-sm font-medium hover:bg-green-500/20 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                                Guardando...
                            </>
                        ) : (
                            <>Guardar Mi Perfil</>
                        )}
                    </button>
                    <button
                        onClick={handleRegenerate}
                        className="glass-card px-5 py-2.5 text-sm font-medium hover:bg-blue-500/20 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                        Actualizar
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <ArtistWidget topArtists={artists.slice(0, 6)} />
                </div>
                <GenreWidget genreStats={genres} />
                <DecadeWidget decadeStats={decades} />
                <MoodWidget moodSummary={mood} />
                <PopularityWidget popularityStats={popularity} />
                <div className="md:col-span-2 xl:col-span-3">
                    <TracksListWidget tracks={tracks.slice(0, 10)} />
                </div>
            </div>
        </div>
    );
}
