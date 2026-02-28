import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    AI_SDK_LOG_WARNINGS: "false",
  },
  images: {
    // Allow data: URLs for base64-encoded image attachments in multi-modal chat
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
    ],
  },
};

export default nextConfig;
