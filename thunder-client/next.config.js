/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'export',          // <-- remplace "next export"
  images: { unoptimized: true }
};

module.exports = nextConfig;
