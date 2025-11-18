'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getSpotifyAuthUrl } from '@/lib/auth';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push('/dashboard');
        }
    }, [router]);

    const handleLogin = () => {
        window.location.href = getSpotifyAuthUrl();
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#121212] via-black to-[#050505] text-white">
            {/* Overlay sutil tipo glass */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(30,215,96,0.18),transparent_55%)]" />

            <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10 lg:px-10">
                {/* Nav superior muy simple */}
                <header className="mb-12 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1DB954] text-black font-semibold">
                            M
                        </div>
                        <span className="text-sm font-medium tracking-wide text-zinc-300">
                            Mixify · Spotify playlists
                        </span>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="hidden rounded-full border border-zinc-700 px-4 py-1.5 text-xs font-medium text-zinc-200 hover:border-zinc-400 hover:bg-zinc-900/60 transition md:inline-flex"
                    >
                        Entrar con Spotify
                    </button>
                </header>

                {/* Hero */}
                <section className="flex flex-1 flex-col-reverse items-center gap-10 md:flex-row md:items-center">
                    <div className="flex-1 space-y-6">
                        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Mezcla tus playlists de Spotify en segundos.
                        </h1>

                        <p className="max-w-xl text-balance text-sm text-zinc-300 sm:text-base">
                            Elige tus playlists, combina estilos y genera una
                            nueva lista perfectamente mezclada para cada
                            momento, sin salir de Spotify.
                        </p>

                        <div className="flex flex-wrap items-center gap-4">
                            <button
                                onClick={handleLogin}
                                className="inline-flex items-center gap-2 rounded-full bg-[#1ED760] px-6 py-2.5 text-sm font-semibold text-black shadow-[0_18px_40px_rgba(0,0,0,0.6)] transition hover:brightness-110 hover:shadow-[0_22px_55px_rgba(0,0,0,0.85)] active:scale-95"
                            >
                                Continuar con Spotify
                                <span className="text-base">▶</span>
                            </button>

                            <span className="text-xs text-zinc-400">
                                Sin contraseñas nuevas · Usamos el login oficial
                                de Spotify
                            </span>
                        </div>
                    </div>

                    {/* Card visual / mockup */}
                    <div className="flex-1">
                        <div className="relative mx-auto max-w-sm rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.65)] backdrop-blur-2xl">
                            <div className="mb-4 flex items-center justify-between text-xs text-zinc-300">
                                <span className="flex items-center gap-2">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1DB954] text-[10px] font-bold text-black">
                                        M
                                    </span>
                                    Mezcla rápida
                                </span>
                                <span className="rounded-full bg-zinc-900/70 px-2 py-1 text-[10px] uppercase tracking-wide text-zinc-400">
                                    Preview
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between rounded-2xl bg-zinc-900/70 px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-zinc-400">
                                            Origen 1
                                        </span>
                                        <span className="text-sm font-medium">
                                            Daily Mix · Rock
                                        </span>
                                    </div>
                                    <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300">
                                        74 canciones
                                    </span>
                                </div>

                                <div className="flex items-center justify-between rounded-2xl bg-zinc-900/70 px-3 py-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] text-zinc-400">
                                            Origen 2
                                        </span>
                                        <span className="text-sm font-medium">
                                            Chill & Focus
                                        </span>
                                    </div>
                                    <span className="rounded-full bg-zinc-800 px-2 py-1 text-[10px] text-zinc-300">
                                        52 canciones
                                    </span>
                                </div>

                                <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#1ED760] to-emerald-400 px-3 py-2 text-black">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-semibold uppercase tracking-wide">
                                            Resultado
                                        </span>
                                        <span className="text-sm font-semibold">
                                            Mix perfecto para hoy
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-medium">
                                        Crear playlist
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer mini */}
                <footer className="mt-10 flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Este proyecto no está afiliado a Spotify.</span>
                    <span className="hidden sm:inline">
                        Hecho con Next.js · Tailwind · Spotify API
                    </span>
                </footer>
            </div>
        </main>
    );
}
