export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - dublup.io` : 'dublup.io'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Prediction market built on top of Hive-Engine. It allows you to forecast events and be rewarded for predicting them correctly.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    'vue-form-wizard/dist/vue-form-wizard.min.css',
    'vue-loading-overlay/dist/vue-loading.css',
    'emoji-mart-vue-fast/css/emoji-mart.css',
    '@/assets/scss/app.scss'
  ],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '@/plugins/event-bus.client.js',
    '@/plugins/websocket.client.js',
    '@/plugins/vue-chat-scroll.client.js',
    '@/plugins/vue-timers.client.js',
    '@/plugins/vue-loading-overlay.js',
    '@/plugins/vue-icon.js',
    '@/plugins/api.js',
    '@/plugins/sidechain.js',
    '@/plugins/vuelidate.js',
    '@/plugins/chat-api.js',
    '@/plugins/vue-timeago.js',
    '@/plugins/global-mixins.js',
    '@/plugins/vue-notification.js'
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: false,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    ['@nuxtjs/eslint-module', { fix: true }],
    '@nuxtjs/pwa'
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios'
  ],

  bootstrapVue: {
    bootstrapCSS: false,
    bootstrapVueCSS: false,

    componentPlugins: [
      'AlertPlugin',
      'LayoutPlugin',
      'NavbarPlugin',
      'FormPlugin',
      'FormCheckboxPlugin',
      'FormGroupPlugin',
      'FormSelectPlugin',
      'FormInputPlugin',
      'FormTextareaPlugin',
      'FormRadioPlugin',
      'FormDatepickerPlugin',
      'FormTimepickerPlugin',
      'ToastPlugin',
      'ModalPlugin',
      'ButtonPlugin',
      'SpinnerPlugin',
      'CardPlugin',
      'ImagePlugin',
      'TablePlugin',
      'PaginationPlugin',
      'TabsPlugin',
      'PopoverPlugin',
      'InputGroupPlugin',
      'AvatarPlugin',
      'FormTagsPlugin',
      'BadgePlugin',
      'ProgressPlugin',
      'MediaPlugin'
    ]
  },

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {},

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: [
      'vue-icon',
      'vue-pincode-input',
      'vue-chat-scroll',
      'vue-notification',
      'emoji-mart-vue-fast/src/components/Emoji',
      'emoji-mart-vue-fast/src/components/Picker',
      'emoji-mart-vue-fast/src/utils/emoji-data',
      'emoji-mart-vue-fast/src/utils/shared-props',
      'emoji-mart-vue-fast/data/twitter.json'
    ],

    babel: {
      compact: true
    }
  },

  server: {
    port: 8080
  },

  router: {
    linkActiveClass: 'active'
  },

  publicRuntimeConfig: {
    API_BASE_URL: process.env.API_BASE_URL,
    WS_SERVER: process.env.WS_SERVER,
    CHAT_API: process.env.CHAT_API,
    CHAT_WS: process.env.CHAT_WS,
    CHAT_CHANNELS: process.env.CHAT_CHANNELS,
    EXPLORER_URL: 'https://he.dtools.dev'
  },

  pwa: {
    meta: {
      name: 'dublup.io',
      author: 'dublup.io'
    },

    manifest: {
      name: 'dublup.io',
      short_name: 'dublup',
      theme_color: '#2d3748'
    }
  }
}
