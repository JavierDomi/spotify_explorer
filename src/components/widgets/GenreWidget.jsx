export default function GenreWidget({ genreStats = [] }) {
    // genreStats: [{ name: 'rock', count: 34, percentage: 0.27 }, ...]

    const total = genreStats.reduce((acc, g) => acc + (g.count || 0), 0);

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                    Géneros dominantes
                </h2>
                <span className="text-[11px] text-zinc-400">
                    {total} canciones analizadas
                </span>
            </header>

            {genreStats.length === 0 ? (
                <p className="text-xs text-zinc-400">
                    Aún no hay géneros calculados para esta mezcla.
                </p>
            ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {genreStats.map((genre) => {
                        const percent = Math.round(
                            (genre.percentage || genre.count / total || 0) * 100
                        );

                        return (
                            <li key={genre.name} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="capitalize text-zinc-200">
                                        {genre.name}
                                    </span>
                                    <span className="text-[11px] text-zinc-400">
                                        {percent}% · {genre.count} canciones
                                    </span>
                                </div>

                                <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                    <div
                                        className="absolute inset-y-0 left-0 rounded-full bg-emerald-400"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
