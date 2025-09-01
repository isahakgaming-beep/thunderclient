/** @type {import('next').NextConfig} */
const nextConfig = {
  // Demande à Next de sortir un site statique dans `out/`
  output: 'export',

  // Si tu utilises <Image/>, ça évite les warnings en mode statique
  images: { unoptimized: true },

  // Évite certaines 404 quand on charge des fichiers locaux
  trailingSlash: true,
};

module.exports = nextConfig;
