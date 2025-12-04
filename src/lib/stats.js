import { getArtistsDetails, getAudioFeatures } from './tracks';

export async function getArtistStatsFromTracks(tracks) {
    const artistMap = new Map();

    tracks.forEach((track) => {
        const artist = track?.artists?.[0];
        if (!artist?.id) return;

        if (!artistMap.has(artist.id)) {
            artistMap.set(artist.id, {
                count: 0,
                data: {
                    id: artist.id,
                    name: artist.name,
                    image: null,
                    genres: [],
                    popularity: null,
                },
            });
        }
        artistMap.get(artist.id).count += 1;
    });

    const artistIds = Array.from(artistMap.keys());
    if (artistIds.length === 0) return [];

    const artistsDetails = await getArtistsDetails(artistIds);

    artistsDetails.forEach((artist) => {
        const entry = artistMap.get(artist.id);
        if (!entry) return;
        entry.data.genres = artist.genres || [];
        entry.data.popularity = artist.popularity ?? null;
        entry.data.image = artist.images?.[0]?.url || null;
    });

    return Array.from(artistMap.values())
        .sort((a, b) => b.count - a.count)
        .map((entry) => entry.data);
}

export function getGenreStatsFromTracks(tracks, artistsById = {}) {
    const genreCount = new Map();
    let total = 0;

    tracks.forEach((track) => {
        (track.artists || []).forEach((a) => {
            const genres = artistsById[a.id]?.genres || [];
            genres.forEach((g) => {
                const key = g.toLowerCase();
                genreCount.set(key, (genreCount.get(key) || 0) + 1);
                total += 1;
            });
        });
    });

    return Array.from(genreCount.entries())
        .map(([name, count]) => ({
            name,
            count,
            percentage: total ? count / total : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
}

export function getDecadeStatsFromTracks(tracks) {
    const decadeMap = new Map();

    tracks.forEach((track) => {
        const dateStr = track?.album?.release_date;
        if (!dateStr) return;

        const year = new Date(dateStr).getFullYear();
        if (!Number.isFinite(year)) return;

        const decadeStart = Math.floor(year / 10) * 10;
        const label = `${decadeStart}s`;
        decadeMap.set(label, (decadeMap.get(label) || 0) + 1);
    });

    return Array.from(decadeMap.entries())
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => parseInt(a.decade) - parseInt(b.decade));
}

export function getPopularityStatsFromTracks(tracks) {
    const pops = tracks
        .map((t) => t.popularity)
        .filter((p) => typeof p === 'number');

    if (pops.length === 0) return null;

    const total = pops.reduce((acc, p) => acc + p, 0);
    const buckets = [
        { label: '0–20', min: 0, max: 20 },
        { label: '21–40', min: 21, max: 40 },
        { label: '41–60', min: 41, max: 60 },
        { label: '61–80', min: 61, max: 80 },
        { label: '81–100', min: 81, max: 100 },
    ];

    return {
        average: Math.round(total / pops.length),
        min: Math.min(...pops),
        max: Math.max(...pops),
        histogram: buckets.map((b) => ({
            range: b.label,
            count: pops.filter((p) => p >= b.min && p <= b.max).length,
        })),
    };
}

export async function getMoodSummaryFromTracks(tracks) {
    const trackIds = tracks.map((t) => t.id).filter(Boolean);
    if (trackIds.length === 0) return null;

    const allFeatures = await getAudioFeatures(trackIds);
    if (allFeatures.length === 0) return null;

    const sum = allFeatures.reduce(
        (acc, f) => {
            acc.energy += f.energy ?? 0;
            acc.danceability += f.danceability ?? 0;
            acc.valence += f.valence ?? 0;
            return acc;
        },
        { energy: 0, danceability: 0, valence: 0 }
    );

    const n = allFeatures.length;
    const energy = sum.energy / n;
    const danceability = sum.danceability / n;
    const valence = sum.valence / n;

    let dominantMood = 'desconocido';
    if (energy < 0.4 && valence < 0.4) dominantMood = 'chill / melancólico';
    else if (energy < 0.5 && valence >= 0.4) dominantMood = 'relajado';
    else if (energy >= 0.5 && valence < 0.5) dominantMood = 'intenso';
    else if (energy >= 0.5 && valence >= 0.5)
        dominantMood = 'fiestero / alegre';

    return { dominantMood, energy, danceability, valence };
}
