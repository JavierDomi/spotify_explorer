/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Para producción standalone

    // Desactivar prerenderizado problemático
    generateStaticParams: async () => [],

    // Fuerza dynamic rendering para auth callback
    async rewrites() {
        return [
            {
                source: '/auth/callback',
                destination: '/auth/callback',
                has: [],
            },
        ];
    },
};

module.exports = nextConfig;
