import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // 👈 Tells Next.js to generate static HTML/CSS/JS
  images: {
    unoptimized: true, // 👈 Required because GitHub Pages doesn't support Next.js image optimization
  },
};

export default nextConfig;
