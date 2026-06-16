import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gestetner.lk",
      },
    ],
  },
};

export default nextConfig;
