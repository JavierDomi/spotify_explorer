import { getArtistTopTracks, searchTracksByGenre } from './tracks';

export async function generatePlaylist(preferences) {
    const { artists = [], genres = [], decades = [], popularity } = preferences;

    let allTracks = [];

    // Top tracks de artistas
    for (const artist of artists) {
        const tracks = await getArtistTopTracks(artist.id);
        allTracks.push(...tracks);
    }

    // Buscar por géneros
    for (const genre of genres) {
        const tracks = await searchTracksByGenre(genre);
        allTracks.push(...tracks);
    }

    // Filtrar por década
    if (decades.length > 0) {
        allTracks = allTracks.filter((track) => {
            if (!track?.album?.release_date) return false;
            const year = new Date(track.album.release_date).getFullYear();
            return decades.some((decade) => {
                const decadeStart = parseInt(decade, 10);
                return year >= decadeStart && year < decadeStart + 10;
            });
        });
    }

    // Filtrar por popularidad
    if (popularity?.length === 2) {
        const [min, max] = popularity;
        allTracks = allTracks.filter(
            (track) => track.popularity >= min && track.popularity <= max
        );
    }

    // Eliminar duplicados y limitar
    return Array.from(new Map(allTracks.map((t) => [t.id, t])).values()).slice(
        0,
        30
    );
}
