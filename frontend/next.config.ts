import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Needed so Heroku can reverse-proxy / use dyno networking cleanly
  poweredByHeader: false,
};

export default nextConfig;
