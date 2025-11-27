/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    generateStaticParams: async () => [],
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

export default nextConfig;
