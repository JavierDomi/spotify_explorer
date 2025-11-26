'use client';

import { useEffect, useState } from 'react';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenderWidget from '@/components/widgets/GenderWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import TracksListWidget from '@/components/widgets/TracksListWidget';

import {
    generatePlaylist,
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

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const preferences = {
                    artists: [],
                    genres: ['rock', 'pop'],
                    decades: ['2000', '2010'],
                    popularity: [20, 90],
                };

                const generatedTracks = await generatePlaylist(preferences);
                if (cancelled) return;

                const artistsForWidget = await getArtistStatsFromTracks(
                    generatedTracks
                );

                const artistsById = {};
                artistsForWidget.forEach((a) => {
                    artistsById[a.id] = a;
                });

                const genreStats = getGenreStatsFromTracks(
                    generatedTracks,
                    artistsById
                );
                const decadeStats = getDecadeStatsFromTracks(generatedTracks);
                const moodSummary = await getMoodSummaryFromTracks(
                    generatedTracks
                );
                const popularityStats =
                    getPopularityStatsFromTracks(generatedTracks);

                if (cancelled) return;

                setTracks(generatedTracks);
                setArtists(artistsForWidget);
                setGenres(genreStats);
                setDecades(decadeStats);
                setMood(moodSummary);
                setPopularity(popularityStats);
            } catch (err) {
                if (!cancelled) {
                    console.error(err);
                    setError('No se pudieron cargar los datos de la mezcla.');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, []);

    const handleSavePlaylist = async () => {
        try {
            setSaving(true);
            const trackUris = tracks.map((t) => `spotify:track:${t.id}`);
            const date = new Date().toLocaleDateString('es-ES');

            await createPlaylistWithTracks(
                `Mi Mezcla - ${date}`,
                'Playlist generada automáticamente con Spotify Mixer',
                trackUris
            );

            alert('¡Playlist guardada en tu cuenta de Spotify!');
        } catch (err) {
            console.error(err);
            alert('Error al guardar la playlist');
        } finally {
            setSaving(false);
        }
    };

    const handleRegenerate = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="glass-card p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-zinc-300">
                        Cargando mezcla desde Spotify...
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
            {/* Header con acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Tu Mezcla Personalizada
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Generada con {tracks.length} canciones ·{' '}
                        {artists.length} artistas · {genres.length} géneros
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
                            <>💾 Guardar en Spotify</>
                        )}
                    </button>
                    <button
                        onClick={handleRegenerate}
                        className="glass-card px-5 py-2.5 text-sm font-medium hover:bg-blue-500/20 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                    >
                        🔄 Regenerar
                    </button>
                </div>
            </div>

            {/* Grid de widgets */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {/* Fila 1: Artistas destacados (ocupa 2 columnas en XL) */}
                <div className="xl:col-span-2">
                    <ArtistWidget topArtists={artists.slice(0, 6)} />
                </div>
                <GenderWidget genreStats={genres} />

                {/* Fila 2: Estadísticas */}
                <DecadeWidget decadeStats={decades} />
                <MoodWidget moodSummary={mood} />
                <PopularityWidget popularityStats={popularity} />

                {/* Fila 3: Lista de tracks (ocupa todo el ancho) */}
                <div className="md:col-span-2 xl:col-span-3">
                    <TracksListWidget tracks={tracks.slice(0, 10)} />
                </div>
            </div>
        </div>
    );
}
