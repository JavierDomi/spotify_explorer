'use client';

import { useEffect, useState } from 'react';
import { getUserTopArtists, getUserTopTracks } from '@/lib/index';
import ArtistWidget from '@/components/widgets/ArtistWidget';
import TracksListWidget from '@/components/widgets/TracksListWidget';

export default function MyTopPage() {
    const [loading, setLoading] = useState(true);
    const [artists, setArtists] = useState([]);
    const [tracks, setTracks] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const [topArtists, topTracks] = await Promise.all([
                    getUserTopArtists('short_term', 10),
                    getUserTopTracks('short_term', 10),
                ]);
                setArtists(topArtists);
                setTracks(topTracks);
            } catch (e) {
                setError('No se pudieron cargar tus tops');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div>Cargando tops...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="space-y-8">
            <ArtistWidget topArtists={artists} />
            <TracksListWidget tracks={tracks} />
        </div>
    );
}
