'use client';

import { useEffect, useState } from 'react';
import { getRecentlyPlayed } from '@/lib/index';
import TracksListWidget from '@/components/widgets/TracksListWidget';

export default function RecentPage() {
    const [loading, setLoading] = useState(true);
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const recentTracks = await getRecentlyPlayed(20);
                setTracks(recentTracks);
            } catch (e) {
                setError('No se pudieron cargar tu historial reciente');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div>Cargando historial...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2 className="text-lg font-bold mb-4">
                Reproducidas recientemente
            </h2>
            <TracksListWidget
                tracks={tracks}
                title="Tus escuchas recientes..."
            />
        </div>
    );
}
