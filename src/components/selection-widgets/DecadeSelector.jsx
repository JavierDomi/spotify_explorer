'use client';

export default function DecadeSelector({ onSelect, selectedDecades = [] }) {
    const decades = [
        '1950s',
        '1960s',
        '1970s',
        '1980s',
        '1990s',
        '2000s',
        '2010s',
        '2020s',
    ];

    const toggleDecade = (decade) => {
        if (selectedDecades.includes(decade)) {
            onSelect(selectedDecades.filter((d) => d !== decade));
        } else {
            onSelect([...selectedDecades, decade]);
        }
    };

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header>
                <h2 className="text-sm font-semibold tracking-tight">
                    Décadas Musicales
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                    Selecciona las eras que te gustan
                </p>
            </header>

            <div className="grid grid-cols-2 gap-2">
                {decades.map((decade) => {
                    const selected = selectedDecades.includes(decade);

                    return (
                        <button
                            key={decade}
                            onClick={() => toggleDecade(decade)}
                            className={`
                                px-4 py-3 rounded-lg text-sm font-medium transition-all
                                ${
                                    selected
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }
                            `}
                        >
                            {decade}
                        </button>
                    );
                })}
            </div>

            {selectedDecades.length > 0 && (
                <p className="text-xs text-center text-zinc-400">
                    {selectedDecades.length}{' '}
                    {selectedDecades.length === 1
                        ? 'década seleccionada'
                        : 'décadas seleccionadas'}
                </p>
            )}
        </section>
    );
}
