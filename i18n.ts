import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'tr',
  fallbackLocale: 'en',
  messages: {
    tr: { hello: 'Merhaba' },
    en: { hello: 'Hello' }
  }
})

export default i18n