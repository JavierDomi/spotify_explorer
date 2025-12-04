import { spotifyFetch, spotifyFetchAll } from './api';
import { fetchUserData } from './user';

export async function getUserPlaylists(limit = 50) {
    const data = await spotifyFetch(`/me/playlists?limit=${limit}`);
    return data.items || [];
}

export async function getPlaylistTracks(playlistId) {
    const items = await spotifyFetchAll(
        `/playlists/${playlistId}/tracks?limit=100`,
        'items'
    );
    return items.map((item) => item.track).filter(Boolean);
}

export async function createPlaylistWithTracks(name, description, trackUris) {
    const userData = await fetchUserData();

    const playlist = await spotifyFetch(`/users/${userData.id}/playlists`, {
        method: 'POST',
        body: JSON.stringify({
            name,
            description,
            public: false,
        }),
    });

    // Añadir tracks en batches de 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < trackUris.length; i += BATCH_SIZE) {
        const batch = trackUris.slice(i, i + BATCH_SIZE);
        await spotifyFetch(`/playlists/${playlist.id}/tracks`, {
            method: 'POST',
            body: JSON.stringify({ uris: batch }),
        });
    }

    return playlist;
}
