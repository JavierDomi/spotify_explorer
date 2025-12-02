export default function MoodWidget({ onSelect, moodValues = {} }) {
    const { energy = 0.5, valence = 0.5, danceability = 0.5 } = moodValues;

    const handleChange = (key, value) => {
        onSelect({ ...moodValues, [key]: parseFloat(value) });
    };

    return (
        <section className="glass-card p-4 space-y-4">
            <h2 className="text-sm font-semibold">Mood y Energía</h2>

            <div className="space-y-3">
                <SliderRow
                    label="Energía"
                    value={energy}
                    onChange={(v) => handleChange('energy', v)}
                />
                <SliderRow
                    label="Positividad"
                    value={valence}
                    onChange={(v) => handleChange('valence', v)}
                />
                <SliderRow
                    label="Bailabilidad"
                    value={danceability}
                    onChange={(v) => handleChange('danceability', v)}
                />
            </div>
        </section>
    );
}

function SliderRow({ label, value, onChange }) {
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span>{label}</span>
                <span>{Math.round(value * 100)}%</span>
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full"
            />
        </div>
    );
}
