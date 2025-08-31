/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  output: 'export',          // important pour générer /out
  images: { unoptimized: true }
};

module.exports = nextConfig;
