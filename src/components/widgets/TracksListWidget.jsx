// /components/widgets/TracksListWidget.jsx
'use client';

import { Trash2, Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

export default function TracksListWidget({
    tracks = [],
    onRemoveTrack,
    title,
}) {
    const { isFavorite, toggleFavorite } = useFavorites();

    if (!tracks || tracks.length === 0) {
        return null;
    }

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = ((ms % 60000) / 1000).toFixed(0);
        return `${minutes}:${seconds.padStart(2, '0')}`;
    };

    // Eliminar tracks duplicados por id para keys únicas
    const uniqueTracks = Array.from(
        new Map(tracks.map((t) => [t.id, t])).values()
    );

    return (
        <div className="glass-card">
            <div className="p-4 border-b border-zinc-800/50">
                <h3 className="text-sm font-semibold tracking-tight">
                    {title}
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                    {uniqueTracks.length} tracks seleccionados
                </p>
            </div>

            <div className="overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                    {uniqueTracks.map((track, index) => {
                        const favorite = isFavorite(track.id);

                        return (
                            <div
                                key={track.id}
                                className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 
                                         transition-colors border-b border-zinc-800/30 last:border-b-0 group"
                            >
                                <span className="text-zinc-500 text-xs font-mono w-6 text-right">
                                    {String(index + 1).padStart(2, '0')}
                                </span>

                                {track.album?.images?.[0] && (
                                    <img
                                        src={track.album.images[0].url}
                                        alt={track.name}
                                        className="w-10 h-10 rounded"
                                    />
                                )}

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

                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                    <span className="hidden sm:block">
                                        {formatDuration(track.duration_ms)}
                                    </span>
                                    <span
                                        className={`
                                        inline-block px-2 py-1 rounded text-[10px] font-medium
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

                                    {/* Favorite Button */}
                                    <button
                                        onClick={() => toggleFavorite(track)}
                                        className={`
                                            p-1.5 rounded-lg transition-all
                                            ${
                                                favorite
                                                    ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                                                    : 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10'
                                            }
                                        `}
                                        title={
                                            favorite
                                                ? 'Quitar de favoritos'
                                                : 'Añadir a favoritos'
                                        }
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

                                    {/* Remove Button */}
                                    {onRemoveTrack && (
                                        <button
                                            onClick={() =>
                                                onRemoveTrack(track.id)
                                            }
                                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 
                                                     hover:bg-red-500/10 transition-all opacity-0 
                                                     group-hover:opacity-100"
                                            title="Eliminar de la playlist"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
