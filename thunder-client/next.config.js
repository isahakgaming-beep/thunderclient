/** @type {import('next').NextConfig} */
const nextConfig = {
  // En CI on ne bloque pas le build sur lints/TS
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
