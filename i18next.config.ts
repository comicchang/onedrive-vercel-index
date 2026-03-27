import { defineConfig } from 'i18next-cli'

export default defineConfig({
  locales: ['de-DE', 'en', 'es', 'zh-CN', 'hi', 'id', 'tr-TR', 'zh-TW'],
  extract: {
    input: ['src/**/*.{ts,tsx}', 'config/**/*.{js,ts}', '*.config.js'],
    defaultNS: 'common',
    keySeparator: false,
    nsSeparator: false,
    pluralSeparator: '——',
    contextSeparator: '——',
    output: 'public/locales/{{language}}/{{namespace}}.json',
    sort: true,
    primaryLanguage: 'zh-CN',
    defaultValue: (key, _namespace, language) => (language === 'zh-CN' ? key : '')
  }
})
