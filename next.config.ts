import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // 👇 Add your exact GitHub repository folder name here with a leading slash
  basePath: '/Web-expense-tracking', 
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
