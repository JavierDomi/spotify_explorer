// widgets/PopularityWidget.jsx

export default function PopularityWidget({ popularityStats }) {
    // popularityStats ejemplo:
    // { average: 62, min: 10, max: 96, histogram: [{ range: '0–20', count: 3 }, ...] }

    if (!popularityStats) {
        return (
            <section className="glass-card p-4 md:p-5 space-y-4">
                <header className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold tracking-tight">
                        Popularidad
                    </h2>
                </header>
                <p className="text-xs text-zinc-400">
                    Aún no hay métricas de popularidad para esta mezcla.
                </p>
            </section>
        );
    }

    const { average, min, max, histogram = [] } = popularityStats;

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                    Popularidad de la mezcla
                </h2>
                <span className="text-[11px] text-zinc-400">
                    Media {average}/100
                </span>
            </header>

            <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Mínimo {min}</span>
                <span>Máximo {max}</span>
            </div>

            <div className="mt-2 space-y-1.5">
                {histogram.map((bucket) => {
                    const percent = histogram.reduce(
                        (acc, b) => acc + b.count,
                        0
                    )
                        ? Math.round(
                              (bucket.count /
                                  histogram.reduce(
                                      (acc, b) => acc + b.count,
                                      0
                                  )) *
                                  100
                          )
                        : 0;

                    return (
                        <div key={bucket.range} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-zinc-300">
                                    {bucket.range}
                                </span>
                                <span className="text-zinc-400">
                                    {bucket.count} · {percent}%
                                </span>
                            </div>
                            <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-emerald-400"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
