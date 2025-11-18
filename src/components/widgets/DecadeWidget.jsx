// widgets/DecadeWidget.jsx

export default function DecadeWidget({ decadeStats = [] }) {
    // decadeStats: [{ decade: '80s', count: 12 }, ...]
    const total = decadeStats.reduce((acc, d) => acc + (d.count || 0), 0);

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                    Décadas
                </h2>
                <span className="text-[11px] text-zinc-400">
                    Distribución temporal de la mezcla
                </span>
            </header>

            {decadeStats.length === 0 ? (
                <p className="text-xs text-zinc-400">
                    Aún no hay información de décadas disponible.
                </p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {decadeStats.map((decade) => {
                        const percent = total
                            ? Math.round((decade.count / total) * 100)
                            : 0;

                        return (
                            <div
                                key={decade.decade}
                                className="chip bg-zinc-900/60 border-zinc-700 text-[11px]"
                            >
                                <span className="font-medium">
                                    {decade.decade}
                                </span>
                                <span className="text-zinc-400">
                                    {percent}% · {decade.count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
