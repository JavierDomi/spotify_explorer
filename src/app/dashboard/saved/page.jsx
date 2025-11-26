'use client';

import { useEffect, useState } from 'react';
import { getUserSavedTracks } from '@/lib/spotify';
import TracksListWidget from '@/components/widgets/TracksListWidget';

export default function SavedPage() {
    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const likedTracks = await getUserSavedTracks(20);
                setTracks(likedTracks);
            } catch (e) {
                setError('No se pudieron cargar tus canciones guardadas');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div>Cargando tus canciones guardadas...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">Tus canciones guardadas</h2>
            <TracksListWidget tracks={tracks} />
        </div>
    );
}
