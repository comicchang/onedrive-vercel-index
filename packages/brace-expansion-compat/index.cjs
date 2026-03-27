const modern = require('brace-expansion-modern')

function expandCompat(pattern, options) {
  return modern.expand(pattern, options)
}

expandCompat.expand = modern.expand
expandCompat.EXPANSION_MAX = modern.EXPANSION_MAX

module.exports = expandCompat
