/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ff.garena.com' },
    ],
  },
  // Halaman utama (/) menampilkan halaman /stalk langsung, tanpa redirect.
  // URL di browser tetap "/", isinya sama persis dengan /stalk.
  async rewrites() {
    return {
      beforeFiles: [{ source: '/', destination: '/stalk' }],
    };
  },
};

module.exports = nextConfig;

const { initOpenNextCloudflareForDev } = require('@opennextjs/cloudflare');
initOpenNextCloudflareForDev();
