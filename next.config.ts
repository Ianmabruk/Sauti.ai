import type { NextConfig } from "next";

/**
 * Root Next.js configuration.
 *
 * The app is a fully client-navigable shell: the dashboard and the four
 * category screens are static routes, so no rewrites or image domains are
 * needed here. `reactStrictMode` surfaces unsafe renders during development.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;