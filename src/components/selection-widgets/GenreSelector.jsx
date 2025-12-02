'use client';
import { useState, useEffect } from 'react';

export default function GenreWidget({ onSelect, selectedGenres = [] }) {
    const [genres, setGenres] = useState([]);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        async function fetchGenres() {
            const token = localStorage.getItem('spotify_token');
            const res = await fetch(
                'https://api.spotify.com/v1/recommendations/available-genre-seeds',
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = await res.json();
            setGenres(data.genres || []);
        }
        fetchGenres();
    }, []);

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            onSelect(selectedGenres.filter((g) => g !== genre));
        } else if (selectedGenres.length < 5) {
            onSelect([...selectedGenres, genre]);
        }
    };

    const filtered = genres.filter((g) =>
        g.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <section className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Géneros Musicales</h2>

            <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filtrar géneros..."
                className="w-full px-3 py-2 rounded bg-zinc-800 text-sm"
            />

            <div className="flex flex-wrap gap-2">
                {filtered.slice(0, 50).map((genre) => (
                    <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`chip ${
                            selectedGenres.includes(genre)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-800 text-zinc-300'
                        }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </section>
    );
}
