'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserPlaylists } from '@/lib/index';

export default function PlaylistsPage() {
    const [loading, setLoading] = useState(true);
    const [playlists, setPlaylists] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function loadPlaylists() {
            try {
                setLoading(true);
                setError(null);
                const data = await getUserPlaylists(50);
                setPlaylists(data);
            } catch (e) {
                setError('No se pudieron cargar tus playlists');
            } finally {
                setLoading(false);
            }
        }

        loadPlaylists();
    }, []);

    if (loading) {
        return <div>Cargando playlists...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (playlists.length === 0) {
        return <div>No tienes playlists disponibles.</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Tus Playlists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {playlists.map((pl) => (
                    <Link
                        key={pl.id}
                        href={`/dashboard/playlists/${pl.id}`}
                        className="glass-card block p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        {pl.images?.[0] && (
                            <img
                                src={pl.images[0].url}
                                alt={pl.name}
                                className="w-full h-40 object-cover rounded-md mb-3"
                            />
                        )}
                        <h3 className="text-lg font-semibold truncate">
                            {pl.name}
                        </h3>
                        <p className="text-sm text-zinc-400 truncate">
                            {pl.description || 'Sin descripción'}
                        </p>
                        <p className="text-xs text-zinc-500 mt-2">
                            {pl.tracks.total} canciones
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
