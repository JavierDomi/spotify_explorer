'use client';

import { useState } from 'react';
import { Sparkles, Save, RefreshCw } from 'lucide-react';

// Selection Widgets (nuevos)
import ArtistSelector from '@/components/selection-widgets/ArtistSelector';
import TrackSelector from '@/components/selection-widgets/TrackSelector';
import GenreSelector from '@/components/selection-widgets/GenreSelector';
import DecadeSelector from '@/components/selection-widgets/DecadeSelector';
import MoodSelector from '@/components/selection-widgets/MoodSelector';
import PopularitySelector from '@/components/selection-widgets/PopularitySelector';

// Analysis Widgets (tus existentes)
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
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
} from '@/lib/index';

export default function MixerPage() {
    // Selection States
    const [selectedArtists, setSelectedArtists] = useState([]);
    const [selectedTracks, setSelectedTracks] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [selectedDecades, setSelectedDecades] = useState([]);
    const [moodValues, setMoodValues] = useState({
        energy: 0.5,
        valence: 0.5,
        danceability: 0.5,
    });
    const [popularityRange, setPopularityRange] = useState([0, 100]);

    // Generated Playlist States
    const [generatedPlaylist, setGeneratedPlaylist] = useState(null);
    const [stats, setStats] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        setGenerating(true);
        setError(null);

        try {
            // 1. Generar playlist con preferencias
            const preferences = {
                artists: selectedArtists,
                genres: selectedGenres,
                decades: selectedDecades.map((d) => d.replace('s', '')), // '1980s' -> '1980'
                popularity: popularityRange,
                mood: moodValues,
            };

            const tracks = await generatePlaylist(preferences);

            if (tracks.length === 0) {
                setError(
                    'No se encontraron canciones con estas preferencias. Intenta ajustar los filtros.'
                );
                return;
            }

            setGeneratedPlaylist(tracks);

            // 2. Calcular estadísticas para widgets de análisis
            const artistStats = await getArtistStatsFromTracks(tracks);
            const artistsById = {};
            artistStats.forEach((a) => {
                artistsById[a.id] = a;
            });

            const genreStats = getGenreStatsFromTracks(tracks, artistsById);
            const decadeStats = getDecadeStatsFromTracks(tracks);
            const moodSummary = await getMoodSummaryFromTracks(tracks);
            const popularityStats = getPopularityStatsFromTracks(tracks);

            setStats({
                artists: artistStats,
                genres: genreStats,
                decades: decadeStats,
                mood: moodSummary,
                popularity: popularityStats,
            });
        } catch (err) {
            console.error('Error generando playlist:', err);
            setError(
                'Error generando la playlist. Por favor, intenta de nuevo.'
            );
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!generatedPlaylist || generatedPlaylist.length === 0) return;

        setSaving(true);
        try {
            const trackUris = generatedPlaylist.map(
                (t) => `spotify:track:${t.id}`
            );
            const date = new Date().toLocaleDateString('es-ES');

            await createPlaylistWithTracks(
                `Mi Mezcla - ${date}`,
                'Generada con Spotify Taste Mixer',
                trackUris
            );

            alert('¡Playlist guardada en tu Spotify!');
        } catch (err) {
            console.error('Error guardando playlist:', err);
            alert('Error al guardar la playlist');
        } finally {
            setSaving(false);
        }
    };

    const hasSelections =
        selectedArtists.length > 0 ||
        selectedTracks.length > 0 ||
        selectedGenres.length > 0 ||
        selectedDecades.length > 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Spotify Taste Mixer
                </h1>
                <p className="text-zinc-400">
                    Personaliza tus preferencias y genera tu playlist perfecta
                </p>
            </div>

            {/* FASE 1: SELECCIÓN */}
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-emerald-400">
                            1
                        </span>
                    </div>
                    <h2 className="text-xl font-semibold">
                        Personaliza tu mezcla
                    </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <ArtistSelector
                        onSelect={setSelectedArtists}
                        selectedArtists={selectedArtists}
                    />
                    <TrackSelector
                        onSelect={setSelectedTracks}
                        selectedTracks={selectedTracks}
                    />
                    <GenreSelector
                        onSelect={setSelectedGenres}
                        selectedGenres={selectedGenres}
                    />
                    <DecadeSelector
                        onSelect={setSelectedDecades}
                        selectedDecades={selectedDecades}
                    />
                    <MoodSelector
                        onSelect={setMoodValues}
                        moodValues={moodValues}
                    />
                    <PopularitySelector
                        onSelect={setPopularityRange}
                        range={popularityRange}
                    />
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleGenerate}
                        disabled={!hasSelections || generating}
                        className="glass-card px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 
                                 hover:from-emerald-600 hover:to-blue-600 
                                 disabled:from-zinc-800 disabled:to-zinc-800
                                 disabled:cursor-not-allowed disabled:opacity-50
                                 transition-all duration-300 hover:scale-105 
                                 flex items-center gap-3 text-lg font-semibold"
                    >
                        {generating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Generando...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generar Playlist
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="glass-card border-red-500/40 bg-red-950/40 p-4 text-center">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}
            </section>

            {/* FASE 2: RESULTADOS */}
            {generatedPlaylist && (
                <>
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-blue-400">
                                        2
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold">
                                    Tu playlist generada
                                </h2>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleGenerate}
                                    className="glass-card px-4 py-2 text-sm hover:bg-blue-500/20 transition flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Regenerar
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="glass-card px-4 py-2 text-sm bg-emerald-500/20 hover:bg-emerald-500/30 
                                             transition flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            Guardar en Spotify
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <TracksListWidget tracks={generatedPlaylist} />
                    </section>

                    {/* FASE 3: ANÁLISIS */}
                    {stats && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-sm font-bold text-purple-400">
                                        3
                                    </span>
                                </div>
                                <h2 className="text-xl font-semibold">
                                    Análisis de tu mezcla
                                </h2>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <ArtistWidget
                                    topArtists={stats.artists.slice(0, 10)}
                                />
                                <GenreWidget genreStats={stats.genres} />
                                <DecadeWidget decadeStats={stats.decades} />
                                <MoodWidget moodSummary={stats.mood} />
                                <PopularityWidget
                                    popularityStats={stats.popularity}
                                />
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
