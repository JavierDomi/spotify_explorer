// /hooks/useFavorites.js
'use client';

import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'spotify_favorite_tracks';

export function useFavorites() {
    const [favorites, setFavorites] = useState([]);

    // Cargar favoritos al montar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(FAVORITES_KEY);
            if (stored) {
                try {
                    setFavorites(JSON.parse(stored));
                } catch (err) {
                    console.error('Error loading favorites:', err);
                    setFavorites([]);
                }
            }
        }
    }, []);

    const toggleFavorite = (track) => {
        setFavorites((prev) => {
            const isFavorite = prev.find((f) => f.id === track.id);
            let updated;

            if (isFavorite) {
                updated = prev.filter((f) => f.id !== track.id);
            } else {
                updated = [...prev, track];
            }

            // Guardar en localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
            }

            return updated;
        });
    };

    const isFavorite = (trackId) => {
        return favorites.some((f) => f.id === trackId);
    };

    const clearFavorites = () => {
        setFavorites([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(FAVORITES_KEY);
        }
    };

    return {
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
        count: favorites.length,
    };
}
