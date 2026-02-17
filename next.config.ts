import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow data: URLs for base64-encoded image attachments in multi-modal chat
    dangerouslyAllowSVG: true,
    remotePatterns: [],
  },
};

export default nextConfig;
