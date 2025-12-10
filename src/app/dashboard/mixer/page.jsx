'use client';

import { useState } from 'react';
import { Sparkles, Save, RefreshCw, Plus } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Selection Widgets
import ArtistSelector from '@/components/selection-widgets/ArtistSelector';
import TrackSelector from '@/components/selection-widgets/TrackSelector';
import GenreSelector from '@/components/selection-widgets/GenreSelector';
import DecadeSelector from '@/components/selection-widgets/DecadeSelector';
import MoodSelector from '@/components/selection-widgets/MoodSelector';
import PopularitySelector from '@/components/selection-widgets/PopularitySelector';

// Analysis Widgets
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenreWidget from '@/components/widgets/GenreWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';
import TracksListWidget from '@/components/widgets/TracksListWidget';

// Modal
import SavePlaylistModal from '@/components/modals/SavePlaylistModal';

// Hooks
import { useFavorites } from '@/hooks/useFavorites';

import {
    generatePlaylist,
    getArtistStatsFromTracks,
    getGenreStatsFromTracks,
    getDecadeStatsFromTracks,
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

    // Modal State
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Favorites hook
    const { favorites } = useFavorites();

    // Guardar preferencias para regenerar
    const [lastPreferences, setLastPreferences] = useState(null);

    const generateWithPreferences = async (
        preferences,
        keepExisting = false
    ) => {
        setGenerating(true);
        setError(null);

        try {
            const tracks = await generatePlaylist(preferences);

            if (tracks.length === 0) {
                setError('No se encontraron canciones con estas preferencias.');
                toast.error('No se encontraron canciones con estos filtros', {
                    duration: 4000,
                });
                return;
            }

            // Si keepExisting, mantener tracks actuales y añadir nuevos (sin duplicados)
            let finalTracks;
            if (keepExisting && generatedPlaylist) {
                const existingIds = new Set(generatedPlaylist.map((t) => t.id));
                const newTracks = tracks.filter((t) => !existingIds.has(t.id));
                finalTracks = [...generatedPlaylist, ...newTracks];
                toast.success(`${newTracks.length} canciones añadidas`, {
                    duration: 3000,
                });
            } else {
                finalTracks = tracks;
                toast.success(`${tracks.length} canciones generadas`, {
                    duration: 3000,
                });
            }

            setGeneratedPlaylist(finalTracks);

            // Calcular estadísticas
            const artistStats = await getArtistStatsFromTracks(finalTracks);
            const artistsById = {};
            artistStats.forEach((a) => {
                artistsById[a.id] = a;
            });

            const genreStats = getGenreStatsFromTracks(
                finalTracks,
                artistsById
            );
            const decadeStats = getDecadeStatsFromTracks(finalTracks);
            const popularityStats = getPopularityStatsFromTracks(finalTracks);

            setStats({
                artists: artistStats,
                genres: genreStats,
                decades: decadeStats,
                popularity: popularityStats,
            });
        } catch (err) {
            console.error('Error generando playlist:', err);
            setError(
                'Error generando la playlist. Por favor, intenta de nuevo.'
            );
            toast.error('Error al generar la playlist', {
                duration: 4000,
            });
        } finally {
            setGenerating(false);
        }
    };

    const handleGenerate = async () => {
        const preferences = {
            artists: selectedArtists,
            tracks: selectedTracks,
            genres: selectedGenres,
            decades: selectedDecades.map((d) => d.replace('s', '')),
            popularity: popularityRange,
            mood: moodValues,
            // Considerar favoritos si existen
            favorites: favorites.length > 0 ? favorites : undefined,
        };

        setLastPreferences(preferences);
        await generateWithPreferences(preferences, false);
    };

    const handleRegenerate = async () => {
        if (!lastPreferences) return;
        await generateWithPreferences(lastPreferences, false);
    };

    const handleAddMore = async () => {
        if (!lastPreferences) return;
        await generateWithPreferences(lastPreferences, true);
    };

    const handleRemoveTrack = (trackId) => {
        // Primero actualizar el estado
        setGeneratedPlaylist((prev) => {
            return prev.filter((track) => track.id !== trackId);
        });

        // Después mostrar el toast
        toast.success('Canción eliminada', { duration: 2000 });
    };

    const handleSaveClick = () => {
        if (!generatedPlaylist || generatedPlaylist.length === 0) return;
        setShowSaveModal(true);
    };

    const handleSavePlaylist = async (playlistName) => {
        setSaving(true);
        try {
            const trackUris = generatedPlaylist.map(
                (t) => `spotify:track:${t.id}`
            );

            await createPlaylistWithTracks(
                playlistName,
                'Generada con Spotify Taste Mixer',
                trackUris
            );

            setShowSaveModal(false);
            toast.success(`"${playlistName}" guardada en Spotify`, {
                duration: 4000,
                style: {
                    background: '#059669',
                    color: '#fff',
                },
            });
        } catch (err) {
            console.error('Error guardando playlist:', err);
            toast.error('Error al guardar la playlist', {
                duration: 4000,
            });
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
            {/* Toast Container */}
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#18181b',
                        color: '#fff',
                        border: '1px solid #27272a',
                    },
                }}
            />

            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Spotify Taste Mixer
                </h1>
                <p className="text-zinc-400">
                    Personaliza tus preferencias y genera tu playlist perfecta
                </p>
                {favorites.length > 0 && (
                    <p className="text-xs text-pink-400">
                        {favorites.length} Canciones en favoritos
                    </p>
                )}
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
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <span className="text-sm font-bold text-blue-400">
                                    2
                                </span>
                            </div>
                            <h2 className="text-xl font-semibold">
                                Tu playlist generada ({generatedPlaylist.length}{' '}
                                canciones)
                            </h2>
                        </div>

                        <TracksListWidget
                            tracks={generatedPlaylist}
                            onRemoveTrack={handleRemoveTrack}
                            title="Canciones en la mezcla"
                        />

                        {/* Action Buttons */}
                        <div className="flex flex-wrap justify-center gap-3 pt-4">
                            <button
                                onClick={handleRegenerate}
                                disabled={generating}
                                className="glass-card px-6 py-3 text-sm hover:bg-blue-500/20 
                                         transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Regenerar
                            </button>

                            <button
                                onClick={handleAddMore}
                                disabled={generating}
                                className="glass-card px-6 py-3 text-sm hover:bg-purple-500/20 
                                         transition flex items-center gap-2 disabled:opacity-50"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir Más
                            </button>

                            <button
                                onClick={handleSaveClick}
                                disabled={saving}
                                className="glass-card px-6 py-3 text-sm bg-emerald-500 hover:bg-emerald-600 
                                         transition flex items-center gap-2 disabled:opacity-50 font-medium"
                            >
                                <Save className="w-4 h-4" />
                                Guardar en Spotify
                            </button>
                        </div>
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <ArtistWidget
                                    topArtists={stats.artists.slice(0, 10)}
                                />
                                <GenreWidget genreStats={stats.genres} />
                                <DecadeWidget decadeStats={stats.decades} />
                                <PopularityWidget
                                    popularityStats={stats.popularity}
                                />
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* Save Playlist Modal */}
            <SavePlaylistModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSavePlaylist}
                isSaving={saving}
            />
        </div>
    );
}
