import { getPlaylistTracks } from '@/lib/spotify';

export default async function PlaylistTracksPage({ params }) {
    const { id } = await params;

    let tracks = [];
    let error = null;

    try {
        tracks = await getPlaylistTracks(id);
    } catch (e) {
        error = 'No se pudieron cargar las canciones de esta playlist.';
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">
                Canciones de la playlist
            </h2>
            {tracks.length === 0 ? (
                <p>No hay canciones en esta playlist.</p>
            ) : (
                <div className="space-y-4">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="glass-card p-4 rounded-lg shadow-md"
                        >
                            <p className="font-semibold">{track.name}</p>
                            <p className="text-sm text-zinc-400">
                                {track.artists.map((a) => a.name).join(', ')}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
