/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['pdf2json'],
  images: {
    domains: ['lh3.googleusercontent.com']
  },
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