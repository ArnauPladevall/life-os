/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESTA ES LA CLAVE: Forzamos la transpilación de la librería problemática
  transpilePackages: ['react-grid-layout'], 
  reactStrictMode: true,
};

export default nextConfig;