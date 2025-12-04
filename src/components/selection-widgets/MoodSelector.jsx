'use client';

export default function MoodSelector({
    onSelect,
    moodValues = { energy: 0.5, valence: 0.5, danceability: 0.5 },
}) {
    const handleChange = (key, value) => {
        onSelect({ ...moodValues, [key]: parseFloat(value) });
    };

    const presets = [
        {
            name: 'Fiesta',
            values: { energy: 0.9, valence: 0.8, danceability: 0.9 },
        },
        {
            name: 'Chill',
            values: { energy: 0.3, valence: 0.6, danceability: 0.4 },
        },
        {
            name: 'Triste',
            values: { energy: 0.3, valence: 0.2, danceability: 0.3 },
        },
        {
            name: 'Workout',
            values: { energy: 0.95, valence: 0.7, danceability: 0.8 },
        },
    ];

    const applyPreset = (preset) => {
        onSelect(preset.values);
    };

    return (
        <section className="glass-card p-4 md:p-5 space-y-4">
            <header>
                <h2 className="text-sm font-semibold tracking-tight">
                    Mood y Energía
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                    Ajusta el vibe de tu mezcla
                </p>
            </header>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 
                                 text-xs font-medium text-zinc-300 transition"
                    >
                        {preset.name}
                    </button>
                ))}
            </div>

            {/* Sliders */}
            <div className="space-y-3">
                <SliderRow
                    label="Energía"
                    value={moodValues.energy}
                    onChange={(v) => handleChange('energy', v)}
                />
                <SliderRow
                    label="Positividad"
                    value={moodValues.valence}
                    onChange={(v) => handleChange('valence', v)}
                />
                <SliderRow
                    label="Bailabilidad"
                    value={moodValues.danceability}
                    onChange={(v) => handleChange('danceability', v)}
                />
            </div>
        </section>
    );
}

function SliderRow({ label, value, onChange }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-300">{label}</span>
                <span className="text-emerald-400 font-medium">
                    {Math.round(value * 100)}%
                </span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer
                         accent-emerald-500"
            />
        </div>
    );
}
