// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*', // Proxy API requests to your backend
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:4000/uploads/:path*', // Proxy uploads requests to your backend
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/',
      },
    ],
    // Since you're using rewrites, you can also allow your own domain
    domains: ['localhost'],
  },
};

module.exports = nextConfig;