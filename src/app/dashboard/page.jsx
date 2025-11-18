import ArtistWidget from '@/widgets/ArtistWidget';
import GenderWidget from '@/widgets/GenderWidget';
import DecadeWidget from '@/widgets/DecadeWidget';
import MoodWidget from '@/widgets/MoodWidget';
import PopularityWidget from '@/widgets/PopularityWidget';

export default function DashboardPage() {
    // Aquí meterías lo que traes de la API / backend
    const dummyArtists = [];
    const dummyGenres = [];
    const dummyDecades = [];
    const dummyMood = null;
    const dummyPopularity = null;

    return (
        <div className="app-shell">
            {/* sidebar ... */}

            <main className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <ArtistWidget topArtists={dummyArtists} />
                    <GenderWidget genreStats={dummyGenres} />
                    <DecadeWidget decadeStats={dummyDecades} />
                    <MoodWidget moodSummary={dummyMood} />
                    <PopularityWidget popularityStats={dummyPopularity} />
                </div>
            </main>
        </div>
    );
}
