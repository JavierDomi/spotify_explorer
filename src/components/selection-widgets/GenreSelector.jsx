'use client';

import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

// Lista de géneros más populares de Spotify
const SPOTIFY_GENRES = [
    'pop',
    'rock',
    'hip-hop',
    'electronic',
    'latin',
    'reggaeton',
    'r-n-b',
    'jazz',
    'classical',
    'country',
    'indie',
    'metal',
    'punk',
    'blues',
    'folk',
    'soul',
    'funk',
    'disco',
    'house',
    'techno',
    'trance',
    'dubstep',
    'drum-and-bass',
    'ambient',
    'alternative',
    'grunge',
    'ska',
    'reggae',
    'gospel',
    'k-pop',
    'j-pop',
    'afrobeat',
    'salsa',
    'bachata',
    'flamenco',
    'tango',
    'samba',
    'bossa-nova',
    'mpb',
    'indie-pop',
    'synth-pop',
    'dance',
    'edm',
    'trap',
    'lo-fi',
    'chill',
    'acoustic',
    'singer-songwriter',
    'progressive-rock',
    'hard-rock',
    'heavy-metal',
    'death-metal',
    'black-metal',
    'power-metal',
    'metalcore',
    'hardcore',
    'emo',
    'screamo',
    'post-rock',
    'math-rock',
    'shoegaze',
    'psychedelic',
    'garage',
    'surf',
    'rockabilly',
    'bluegrass',
    'honky-tonk',
    'outlaw-country',
    'alt-country',
    'americana',
    'world',
    'ethnic',
    'tribal',
    'new-age',
    'meditation',
];

export default function GenreSelector({
    onSelect,
    selectedGenres = [],
    maxGenres = 5,
}) {
    const [filter, setFilter] = useState('');

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            onSelect(selectedGenres.filter((g) => g !== genre));
        } else if (selectedGenres.length < maxGenres) {
            onSelect([...selectedGenres, genre]);
        }
    };

    const clearSelection = () => {
        onSelect([]);
    };

    const filtered = SPOTIFY_GENRES.filter((g) =>
        g.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold tracking-tight">
                        Géneros Musicales
                    </h2>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                        Selecciona hasta {maxGenres} géneros
                    </p>
                </div>
                {selectedGenres.length > 0 && (
                    <span className="text-xs text-emerald-400 font-medium">
                        {selectedGenres.length}/{maxGenres}
                    </span>
                )}
            </header>

            {/* Filter Input */}
            <div className="relative">
                <SearchIcon
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                    style={{ fontSize: '16px' }}
                />
                <input
                    type="text"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filtrar géneros..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800 
                             text-sm text-zinc-200 placeholder-zinc-500
                             focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                {filter && (
                    <button
                        onClick={() => setFilter('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 
                                 hover:text-zinc-200 transition"
                    >
                        <CloseIcon style={{ fontSize: '16px' }} />
                    </button>
                )}
            </div>

            {/* Selected Genres */}
            {selectedGenres.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-zinc-300">
                            Seleccionados
                        </span>
                        <button
                            onClick={clearSelection}
                            className="text-[11px] text-zinc-400 hover:text-red-400 transition"
                        >
                            Limpiar todo
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                        {selectedGenres.map((genre) => (
                            <button
                                key={genre}
                                onClick={() => toggleGenre(genre)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full 
                                         bg-emerald-500 text-white text-xs font-medium
                                         hover:bg-emerald-600 transition"
                            >
                                {genre}
                                <CloseIcon style={{ fontSize: '14px' }} />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Genres Grid */}
            <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {filtered.length > 0 ? (
                    filtered.map((genre) => {
                        const selected = selectedGenres.includes(genre);
                        const atLimit =
                            selectedGenres.length >= maxGenres && !selected;

                        return (
                            <button
                                key={genre}
                                onClick={() => !atLimit && toggleGenre(genre)}
                                disabled={atLimit}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                    ${
                                        selected
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                    }
                                    ${
                                        atLimit
                                            ? 'opacity-30 cursor-not-allowed'
                                            : 'cursor-pointer'
                                    }
                                `}
                            >
                                {genre}
                            </button>
                        );
                    })
                ) : (
                    <div className="w-full text-center py-8">
                        <p className="text-xs text-zinc-500">
                            No se encontraron géneros para "{filter}"
                        </p>
                    </div>
                )}
            </div>

            {/* Info text */}
            {!filter && selectedGenres.length === 0 && (
                <p className="text-center text-xs text-zinc-500">
                    {SPOTIFY_GENRES.length} géneros disponibles
                </p>
            )}
        </section>
    );
}
