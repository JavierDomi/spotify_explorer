export default function PopularityWidget({ onSelect, range = [0, 100] }) {
    return (
        <section className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Popularidad</h2>

            <div className="space-y-2">
                <button
                    onClick={() => onSelect([80, 100])}
                    className="w-full px-4 py-2 rounded bg-zinc-800 text-sm"
                >
                    Mainstream (80-100)
                </button>
                <button
                    onClick={() => onSelect([50, 80])}
                    className="w-full px-4 py-2 rounded bg-zinc-800 text-sm"
                >
                    Popular (50-80)
                </button>
                <button
                    onClick={() => onSelect([0, 50])}
                    className="w-full px-4 py-2 rounded bg-zinc-800 text-sm"
                >
                    Underground (0-50)
                </button>
            </div>

            <div className="text-xs text-zinc-400 text-center">
                Rango actual: {range[0]} - {range[1]}
            </div>
        </section>
    );
}
