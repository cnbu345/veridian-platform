import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactCompiler: true,
  
  // Add this section for external images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',  // This matches all Supabase subdomains
        port: '',
        pathname: '/storage/v1/object/public/**',  // Only allow public storage paths
      },
      // You can also be more specific with your exact hostname:
      // {
      //   protocol: 'https',
      //   hostname: 'mzrwjkcdzrtcsidzibvv.supabase.co',
      //   port: '',
      //   pathname: '/storage/v1/object/public/**',
      // },
    ],
  },
};

export default nextConfig;