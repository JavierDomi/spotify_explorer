module.exports = {
    apps: [
        {
            name: 'spotify_explorer',
            script: 'node_modules/.bin/next',
            args: 'start',
            cwd: '/var/www/spotify_explorer',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            node_args: '-r dotenv/config',
            env_production: {
                NODE_ENV: 'production',
                PORT: 3000,
                DOTENV_CONFIG_PATH: '/var/www/spotify_explorer/.env',
            },
        },
    ],
};
