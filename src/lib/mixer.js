// /lib/mixer.js
import { getArtistTopTracks, searchTracksByGenre } from './tracks';

export async function generatePlaylist(preferences) {
    const {
        artists = [],
        tracks = [],
        genres = [],
        decades = [],
        popularity,
        favorites = [],
    } = preferences;

    let allTracks = [];

    // Priorizar tracks seleccionados manualmente
    if (tracks.length > 0) {
        allTracks.push(...tracks);
    }

    // Incluir favoritos si existen
    if (favorites.length > 0) {
        allTracks.push(...favorites);
    }

    // Top tracks de artistas
    for (const artist of artists) {
        const artistTracks = await getArtistTopTracks(artist.id);
        allTracks.push(...artistTracks);
    }

    // Buscar por géneros
    for (const genre of genres) {
        const genreTracks = await searchTracksByGenre(genre);
        allTracks.push(...genreTracks);
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

    // Eliminar duplicados y limitar a 30
    const uniqueTracks = Array.from(
        new Map(allTracks.map((t) => [t.id, t])).values()
    );

    // Mezclar aleatoriamente y limitar
    return uniqueTracks.sort(() => Math.random() - 0.5).slice(0, 30);
}
