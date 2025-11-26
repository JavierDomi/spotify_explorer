'use client';

import { useEffect, useState } from 'react';
import { getUserPlaylists } from '@/lib/spotify';

export default function PlaylistsPage() {
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                setError(null);
                const allPlaylists = await getUserPlaylists();
                setPlaylists(allPlaylists);
            } catch (e) {
                setError('No se pudieron cargar tus playlists');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div>Cargando playlists...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold">Tus playlists</h2>
            {playlists.map((pl) => (
                <div key={pl.id} className="glass-card p-4 mb-2">
                    <div className="font-semibold">{pl.name}</div>
                    <div className="text-xs text-zinc-400">
                        {pl.tracks.total} canciones
                    </div>
                </div>
            ))}
        </div>
    );
}
