module.exports = {
  apps: [{
    name: 'predictland-frontend',
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    env_production: {
      TZ: 'UTC',
      NODE_ENV: 'production',
      API_BASE_URL: 'https://predictland.dtools.dev/api',
      WS_SERVER: 'wss://predictland.dtools.dev/ws',
      CHAT_API: 'https://beechat.hive-engine.com/api',
      CHAT_WS: 'wss://ws.beechat.hive-engine.com',
      CHAT_CHANNELS: ['01EPB6A2PPSW0BQVJ7WDDP568C']
    }
  }]
}
