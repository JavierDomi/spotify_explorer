'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';

const menuItems = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        icon: <DashboardIcon />,
        description: 'Resumen general',
    },
    {
        href: '/dashboard/my-top',
        label: 'Mis Tops',
        icon: <EmojiEventsIcon />,
        description: 'Artistas y tracks favoritos',
    },
    {
        href: '/dashboard/playlists',
        label: 'Playlists',
        icon: <QueueMusicIcon />,
        description: 'Todas tus playlists',
    },
    {
        href: '/dashboard/saved',
        label: 'Me Gusta',
        icon: <FavoriteIcon />,
        description: 'Canciones guardadas',
    },
    {
        href: '/dashboard/recent',
        label: 'Recientes',
        icon: <HistoryIcon />,
        description: 'Historial de reproducción',
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex md:flex-col md:w-72 glass-card rounded-none border-r border-zinc-800/50">
            {/* Header */}
            <div className="px-6 py-8 border-b border-zinc-800/50">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-green-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
                    Spotify Mixer
                </h1>
                <p className="mt-2 text-xs text-zinc-400">
                    Analiza y mezcla tu música favorita
                </p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                group flex items-start gap-3 px-4 py-3 rounded-xl
                                text-sm font-medium transition-all duration-200
                                ${
                                    isActive
                                        ? 'bg-gradient-to-r from-green-500/20 to-blue-500/20 text-green-400 shadow-lg shadow-green-500/10 border border-green-500/20'
                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                                }
                            `}
                        >
                            <span className="text-2xl mt-0.5">{item.icon}</span>
                            <div className="flex-1">
                                <div
                                    className={`font-semibold ${
                                        isActive
                                            ? 'text-green-400'
                                            : 'text-zinc-300'
                                    }`}
                                >
                                    {item.label}
                                </div>
                                <div className="text-xs text-zinc-500 mt-0.5">
                                    {item.description}
                                </div>
                            </div>
                            {isActive && (
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse mt-2"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-zinc-400">Conectado a Spotify</span>
                </div>
            </div>
        </aside>
    );
}
