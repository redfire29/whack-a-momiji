// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-lodash',
  ],
  tailwindcss: {
    cssPath: [
      '~/assets/css/main.css',
      {
        injectPosition: 'last',
      },
    ],
    configPath: 'tailwind.config.js',
    viewer: false,
  },
  future: {
    compatibilityVersion: 4,
  },
  routeRules: {
    '/': { static: true, prerender: true },
  },
  app: {
    baseURL: '/whack-a-momiji/',
    buildAssetsDir: '/static/',
  }
})
