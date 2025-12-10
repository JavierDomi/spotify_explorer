// app/dashboard/playlists/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getPlaylistTracks } from '@/lib/index';

export default function PlaylistTracksPage() {
    const { id } = useParams();
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        async function loadTracks() {
            try {
                setLoading(true);
                setError(null);
                const data = await getPlaylistTracks(id);
                setTracks(data);
            } catch (e) {
                console.error(e);
                setError(
                    'No se pudieron cargar las canciones de esta playlist.'
                );
            } finally {
                setLoading(false);
            }
        }

        loadTracks();
    }, [id]);

    if (loading) {
        return <div>Cargando canciones de la playlist...</div>;
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
