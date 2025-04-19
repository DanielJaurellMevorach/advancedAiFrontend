import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const config: NextConfig = withPWA({
  reactStrictMode: false,
  // swcMinify: false,
});

export default config;
