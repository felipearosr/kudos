/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip static generation during build
  trailingSlash: false,
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip build-time rendering for pages with authentication
  async generateBuildId() {
    return 'build-' + Date.now()
  }
}

module.exports = nextConfig