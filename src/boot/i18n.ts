import { boot } from 'quasar/wrappers'
import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  legacy: false,       
  messages: {
    tr: {
      hello: 'Merhaba'
    },
    en: {
      hello: 'Hello'
    }
  }
})

export default boot(({ app }: { app: any }) => {
  app.use(i18n)
})