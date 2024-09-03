/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        os: false,
        path: false,
        module: false
      }
      config.resolve.alias['@scrypt-inc/bsv'] = '@scrypt-inc/bsv/dist/index.js'
    }
    return config;
  },
  transpilePackages: ['@scrypt-inc/bsv']
}

module.exports = nextConfig
