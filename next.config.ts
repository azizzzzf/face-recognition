import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack configuration (moved from experimental as it's now stable)
  turbopack: {},
  
  // Experimental features for better performance
  experimental: {
    // Optimize CSS - disabled temporarily due to critters issue
    // optimizeCss: true,
  },

  // Disable ESLint during build for now
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            // Create separate chunks for heavy libraries
            faceapi: {
              test: /[\\/]node_modules[\\/](@vladmandic\/face-api|face-api\.js)[\\/]/,
              name: 'face-api',
              chunks: 'all',
              priority: 30,
            },
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase',
              chunks: 'all',
              priority: 20,
            },
            ui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'ui-components',
              chunks: 'all',
              priority: 10,
            },
          },
        },
      };
    }

    // Disable aggressive tree shaking for lucide-react icons temporarily
    // if (!isServer) {
    //   config.resolve.alias = {
    //     ...config.resolve.alias,
    //     'lucide-react': 'lucide-react/dist/esm/icons',
    //   };
    // }

    return config;
  },

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirect optimization
  async redirects() {
    return [];
  },
};

export default nextConfig;
