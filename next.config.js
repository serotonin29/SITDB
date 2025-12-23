/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost'],
    },
    // Enable standalone output for Docker
    output: 'standalone',
}

module.exports = nextConfig
