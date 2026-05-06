import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/registry/ferrari-288-gto',
        destination: '/ferrari/288-gto',
        permanent: true,
      },
      {
        source: '/registry/ferrari-288-gto/:chassis',
        destination: '/ferrari/288-gto/:chassis',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: 'http://supabase-kong-jfv9tg8856siubdjcfi7cwmb:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
