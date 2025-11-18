// widgets/MoodWidget.jsx

export default function MoodWidget({ moodSummary }) {
    // moodSummary ejemplo:
    // { dominantMood: 'chill', energy: 0.45, danceability: 0.7, valence: 0.6 }
    const {
        dominantMood = 'desconocido',
        energy = 0,
        danceability = 0,
        valence = 0,
    } = moodSummary || {};

    const meter = (value) => `${Math.round(value * 100)}%`;

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                    Mood de la mezcla
                </h2>
                <span className="rounded-full bg-zinc-900/70 px-2 py-0.5 text-[11px] uppercase tracking-wide text-zinc-300">
                    {dominantMood}
                </span>
            </header>

            {!moodSummary ? (
                <p className="text-xs text-zinc-400">
                    Calcula el estado de ánimo de tu mezcla para ver este
                    widget.
                </p>
            ) : (
                <div className="space-y-3 text-xs">
                    <MoodRow label="Energía" value={energy} />
                    <MoodRow label="Bailabilidad" value={danceability} />
                    <MoodRow label="Positividad" value={valence} />
                </div>
            )}
        </section>
    );

    function MoodRow({ label, value }) {
        const percent = Math.round(value * 100);

        return (
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <span>{label}</span>
                    <span className="text-[11px] text-zinc-400">
                        {meter(value)}
                    </span>
                </div>
                <div className="relative h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-yellow-300"
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
        );
    }
}
