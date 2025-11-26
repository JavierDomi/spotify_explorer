'use client';

import { useEffect, useState } from 'react';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import GenderWidget from '@/components/widgets/GenderWidget';
import DecadeWidget from '@/components/widgets/DecadeWidget';
import MoodWidget from '@/components/widgets/MoodWidget';
import PopularityWidget from '@/components/widgets/PopularityWidget';

// Importa directamente tus helpers de lib/spotify
import {
    generatePlaylist,
    getArtistStatsFromTracks,
    getGenreStatsFromTracks,
    getDecadeStatsFromTracks,
    getMoodSummaryFromTracks,
    getPopularityStatsFromTracks,
} from '@/lib/spotify';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [artists, setArtists] = useState([]);
    const [genres, setGenres] = useState([]);
    const [decades, setDecades] = useState([]);
    const [mood, setMood] = useState(null);
    const [popularity, setPopularity] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Aquí decides las preferencias de prueba o las que el usuario haya elegido
                // De momento algo muy simple / hardcodeado para clase:
                const preferences = {
                    artists: [], // [{ id: '...' }]
                    genres: ['rock', 'pop'],
                    decades: ['2000', '2010'],
                    popularity: [20, 90],
                };

                // 1) Generar la playlist con los helpers de lib/spotify
                const tracks = await generatePlaylist(preferences);
                if (cancelled) return;

                // 2) Calcular todos los datos para los widgets
                const artistsForWidget = await getArtistStatsFromTracks(tracks);

                const artistsById = {};
                artistsForWidget.forEach((a) => {
                    artistsById[a.id] = a;
                });

                const genreStats = getGenreStatsFromTracks(tracks, artistsById);
                const decadeStats = getDecadeStatsFromTracks(tracks);
                const moodSummary = await getMoodSummaryFromTracks(tracks);
                const popularityStats = getPopularityStatsFromTracks(tracks);

                if (cancelled) return;

                // 3) Guardar en estado
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

    return (
        <div className="app-shell">
            {/* Sidebar muy básica */}
            <aside className="app-sidebar hidden md:block">
                <h1 className="text-sm font-semibold tracking-tight">
                    Mezclador de playlists
                </h1>
                <p className="mt-1 text-xs text-zinc-400">
                    Resumen de tu mezcla generada con Spotify.
                </p>
            </aside>

            <main className="space-y-4">
                {loading && (
                    <div className="glass-card p-4 text-xs text-zinc-300">
                        Cargando mezcla desde Spotify...
                    </div>
                )}

                {error && (
                    <div className="glass-card border-red-500/40 bg-red-950/40 p-4 text-xs text-red-200">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <ArtistWidget topArtists={artists} />
                        <GenderWidget genreStats={genres} />
                        <DecadeWidget decadeStats={decades} />
                        <MoodWidget moodSummary={mood} />
                        <PopularityWidget popularityStats={popularity} />
                    </div>
                )}
            </main>
        </div>
    );
}
