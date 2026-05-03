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
};

export default nextConfig;
