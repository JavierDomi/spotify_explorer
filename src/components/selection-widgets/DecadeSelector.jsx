export default function DecadeWidget({ onSelect, selectedDecades = [] }) {
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
        <section className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Décadas</h2>

            <div className="grid grid-cols-2 gap-2">
                {decades.map((decade) => (
                    <button
                        key={decade}
                        onClick={() => toggleDecade(decade)}
                        className={`px-4 py-2 rounded text-sm ${
                            selectedDecades.includes(decade)
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-800 text-zinc-300'
                        }`}
                    >
                        {decade}
                    </button>
                ))}
            </div>
        </section>
    );
}
