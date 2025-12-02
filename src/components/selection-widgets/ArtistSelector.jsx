'use client';
import { useState, useEffect } from 'react';

export default function ArtistWidget({ onSelect, selectedArtists = [] }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    // Debouncing para búsqueda
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('spotify_token');
                const res = await fetch(
                    `https://api.spotify.com/v1/search?type=artist&q=${encodeURIComponent(
                        query
                    )}&limit=10`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setResults(data.artists?.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, 500); // Debounce de 500ms

        return () => clearTimeout(timer);
    }, [query]);

    const toggleArtist = (artist) => {
        const isSelected = selectedArtists.some((a) => a.id === artist.id);
        if (isSelected) {
            onSelect(selectedArtists.filter((a) => a.id !== artist.id));
        } else if (selectedArtists.length < 5) {
            onSelect([...selectedArtists, artist]);
        }
    };

    return (
        <section className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Buscar Artistas</h2>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busca artistas..."
                className="w-full px-3 py-2 rounded bg-zinc-800 text-sm"
            />

            {/* Artistas seleccionados */}
            {selectedArtists.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedArtists.map((artist) => (
                        <div
                            key={artist.id}
                            className="chip bg-emerald-500/20 text-emerald-400"
                        >
                            {artist.name}
                            <button onClick={() => toggleArtist(artist)}>
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Resultados de búsqueda */}
            {loading && <p className="text-xs text-zinc-400">Buscando...</p>}

            <ul className="space-y-2 max-h-60 overflow-y-auto">
                {results.map((artist) => (
                    <li
                        key={artist.id}
                        onClick={() => toggleArtist(artist)}
                        className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-zinc-800"
                    >
                        {artist.images?.[0] && (
                            <img
                                src={artist.images[0].url}
                                alt={artist.name}
                                className="w-10 h-10 rounded-full"
                            />
                        )}
                        <span className="text-sm">{artist.name}</span>
                        {selectedArtists.some((a) => a.id === artist.id) && (
                            <span className="ml-auto text-emerald-400">✓</span>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
