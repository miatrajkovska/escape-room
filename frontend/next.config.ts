import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // На RepoRun (Docker) прелистувачот вика /api/... на истиот домен,
  // а Next.js го препраќа барањето до backend-от (api сервисот).
  // На Vercel API_INTERNAL_URL не постои, па нема препраќање.
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL;
    if (!apiUrl) return [];
    return [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }];
  },
};

export default nextConfig;
