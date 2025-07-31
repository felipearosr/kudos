/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Optimize bundle size and caching
  webpack: (config, { isServer, dev }) => {
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

    // Optimize caching to reduce serialization warnings
    if (dev && config.cache && config.cache.type === 'filesystem') {
      config.cache = {
        ...config.cache,
        maxMemoryGenerations: 1,
        compression: 'gzip',
        // Keep filesystem cache but optimize it
        buildDependencies: {
          ...config.cache.buildDependencies,
          config: [__filename],
        },
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
}

module.exports = nextConfig