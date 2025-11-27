// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'spotify_explorer',
            script: 'pnpm',
            args: 'start',
            cwd: '/var/www/spotify_explorer',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_file: '/var/www/spotify_explorer/.env',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
