const { i18n } = require('./next-i18next.config')

module.exports = {
  i18n,
  reactStrictMode: true,
  turbopack: {},
  // Required by Next i18n with API routes, otherwise API routes 404 when fetching without trailing slash
  trailingSlash: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  webpack: config => {
    const oneOfRule = config.module.rules.find(rule => rule && typeof rule === 'object' && 'oneOf' in rule)
    if (oneOfRule && Array.isArray(oneOfRule.oneOf)) {
      oneOfRule.oneOf.unshift({
        test: /[\\/]office-file-viewer[\\/]dist[\\/].*\.css$/,
        issuer: /[\\/]office-file-viewer[\\/]dist[\\/]/,
        type: 'asset/resource',
      })
    }
    return config
  },
}
