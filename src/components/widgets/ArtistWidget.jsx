// widgets/ArtistWidget.jsx

export default function ArtistWidget({ topArtists = [] }) {
    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                    Artistas más escuchados
                </h2>
                <span className="text-[11px] text-zinc-400">
                    Top {topArtists.length || 0}
                </span>
            </header>

            {topArtists.length === 0 ? (
                <p className="text-xs text-zinc-400">
                    Aún no hay datos. Mezcla una playlist para ver tus artistas
                    más recurrentes.
                </p>
            ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {topArtists.map((artist, index) => (
                        <li
                            key={artist.id || artist.name || index}
                            className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-zinc-900/40 transition"
                        >
                            <span className="w-5 text-[11px] text-zinc-500">
                                #{index + 1}
                            </span>

                            {artist.image && (
                                <img
                                    src={artist.image}
                                    alt={artist.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            )}

                            <div className="flex-1 min-w-0">
                                <p className="truncate text-xs font-medium">
                                    {artist.name}
                                </p>
                                {artist.genres && artist.genres.length > 0 && (
                                    <p className="truncate text-[11px] text-zinc-400">
                                        {artist.genres.slice(0, 2).join(' · ')}
                                    </p>
                                )}
                            </div>

                            {typeof artist.popularity === 'number' && (
                                <span className="text-[11px] text-zinc-400">
                                    {artist.popularity}/100
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
