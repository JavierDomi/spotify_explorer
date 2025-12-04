'use client';

export default function PopularitySelector({ onSelect, range = [0, 100] }) {
    const presets = [
        { label: 'Mainstream 🔥', range: [80, 100], desc: 'Hits del momento' },
        {
            label: 'Popular 🎵',
            range: [50, 80],
            desc: 'Conocidas pero no masivas',
        },
        { label: 'Underground 💎', range: [0, 50], desc: 'Joyas ocultas' },
        { label: 'Todo 🌍', range: [0, 100], desc: 'Sin filtro' },
    ];

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header>
                <h2 className="text-sm font-semibold tracking-tight">
                    Popularidad
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                    Hits mainstream o joyas ocultas
                </p>
            </header>

            <div className="space-y-2">
                {presets.map((preset) => {
                    const selected =
                        range[0] === preset.range[0] &&
                        range[1] === preset.range[1];

                    return (
                        <button
                            key={preset.label}
                            onClick={() => onSelect(preset.range)}
                            className={`
                                w-full p-3 rounded-lg text-left transition-all
                                ${
                                    selected
                                        ? 'bg-emerald-500/20 border-2 border-emerald-500'
                                        : 'bg-zinc-800 border-2 border-transparent hover:bg-zinc-700'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    {preset.label}
                                </span>
                                {selected && (
                                    <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={3}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">
                                {preset.desc}
                            </p>
                        </button>
                    );
                })}
            </div>

            <div className="text-xs text-center text-zinc-400 pt-2 border-t border-zinc-800">
                Rango actual: {range[0]} - {range[1]}
            </div>
        </section>
    );
}
