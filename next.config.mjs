/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "api.dicebear.com" },
      // IncaCook backend (KYC docs, avatars) — prod (Railway) + local dev.
      { protocol: "https", hostname: "incacook-api-production.up.railway.app" },
      { protocol: "http", hostname: "127.0.0.1", port: "3001" },
      { protocol: "http", hostname: "localhost", port: "3001" },
    ],
  },
};

export default nextConfig;
