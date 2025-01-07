/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf2json'],
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      encoding: false
    };
    return config;
  }
};

module.exports = nextConfig;