
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['9003-firebase-studio-1749121036714.cluster-isls3qj2gbd5qs4jkjqvhahfv6.cloudworkstations.dev'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // Add this line to disable image optimization
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Wildcard for any HTTPS hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Wildcard for any HTTP hostname
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
