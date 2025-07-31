/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production optimizations
  poweredByHeader: false, // Remove X-Powered-By header for security
  compress: true, // Enable gzip compression
  
  // Experimental features
  experimental: {
    missingSuspenseWithCSRBailout: false,
    // optimizeCss: true, // Disabled due to critters dependency issue
    optimizePackageImports: ['lucide-react', '@radix-ui/react-avatar', '@radix-ui/react-dialog'], // Optimize package imports
  },
  
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'], // Use modern image formats
    minimumCacheTTL: 60 * 60 * 24 * 30, // Cache images for 30 days
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/embed/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL' // Allow embedding for tip widgets
          }
        ]
      }
    ]
  },
  
  // Webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Client-side optimizations
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        os: false,
        url: false,
        zlib: false,
      }
    }

    // Development optimizations
    if (dev && config.cache && config.cache.type === 'filesystem') {
      config.cache = {
        ...config.cache,
        maxMemoryGenerations: 1,
        compression: 'gzip',
        buildDependencies: {
          ...config.cache.buildDependencies,
          config: [__filename],
        },
      }
    }

    // Production optimizations
    if (!dev) {
      // Tree shaking optimizations
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      }
      
      // Bundle analyzer when ANALYZE=true
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analyzer-report.html',
          })
        )
      }
    }

    // Optimize crypto/web3 libraries
    config.externals = config.externals || []
    if (!isServer) {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
    }

    return config
  },
  
  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Output configuration for static export (if needed)
  trailingSlash: false,
  
  // Environment variables that should be available on the client
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig