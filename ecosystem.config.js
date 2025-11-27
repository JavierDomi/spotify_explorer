module.exports = {
    apps: [
        {
            name: 'spotify_explorer',
            script: 'node',
            args: '.next/standalone/server.js',
            cwd: '/var/www/spotify_explorer',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
            },
        },
    ],
};
