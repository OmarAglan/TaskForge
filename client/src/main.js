import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { createI18n } from 'vue-i18n'

import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import App from './App.vue'
import router from './router'

// Import locale messages
import en from './locales/en.json'
import ar from './locales/ar.json'

const app = createApp(App)

// Determine initial locale
const savedLocale = localStorage.getItem('user-locale') || 'en';

// Setup i18n
const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: savedLocale, // Set locale from localStorage or default
  fallbackLocale: 'en', // Fallback locale
  messages: {
    en, // English messages
    ar  // Arabic messages
  }
})

// Configure Vuetify RTL and locale integration
const vuetify = createVuetify({
  locale: {
    // Use i18n locale ref directly
    locale: i18n.global.locale,
    // Define which languages are RTL
    rtl: {
      ar: true,
    },
    // You might need Vuetify's own messages for built-in components
    // import { en, ar } from 'vuetify/locale'
    // messages: { en, ar } // Add this if needed later
  },
  theme: {
      defaultTheme: 'dark'
  },
  components,
  directives,
})

app.use(createPinia())
app.use(vuetify)
app.use(i18n)
app.use(router)
app.mount('#app')
