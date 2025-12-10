// /components/modals/SavePlaylistModal.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, X } from 'lucide-react';

export default function SavePlaylistModal({
    isOpen,
    onClose,
    onSave,
    isSaving,
}) {
    const [playlistName, setPlaylistName] = useState('');
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (isOpen) {
            dialog.showModal();
            // Generar nombre por defecto
            const date = new Date().toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
            setPlaylistName(`Mi Mezcla - ${date}`);
        } else {
            dialog.close();
        }
    }, [isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (playlistName.trim()) {
            onSave(playlistName.trim());
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            setPlaylistName('');
            onClose();
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            className="fixed inset-0 z-50 backdrop:bg-black/70 backdrop:backdrop-blur-sm 
                     bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl 
                     p-0 w-[90vw] max-w-md"
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">
                        Guardar Playlist
                    </h3>
                    <button
                        onClick={handleClose}
                        disabled={isSaving}
                        className="text-zinc-400 hover:text-zinc-200 transition disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-300 mb-2">
                            Nombre de la playlist
                        </label>
                        <input
                            type="text"
                            value={playlistName}
                            onChange={(e) => setPlaylistName(e.target.value)}
                            placeholder="Ej: Mi Playlist Perfecta"
                            disabled={isSaving}
                            autoFocus
                            maxLength={100}
                            className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 
                                     text-sm text-zinc-200 placeholder-zinc-500
                                     focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-zinc-500 mt-1.5">
                            {playlistName.length}/100 caracteres
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 
                                     text-sm font-medium transition disabled:opacity-50 text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!playlistName.trim() || isSaving}
                            className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 
                                     text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2 text-white"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Guardar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
