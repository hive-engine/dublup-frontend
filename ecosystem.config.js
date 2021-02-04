module.exports = {
  apps: [{
    name: 'dublup-frontend',
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    env_production: {
      TZ: 'UTC',
      NODE_ENV: 'production',
      API_BASE_URL: 'https://api.dublup.io',
      WS_SERVER: 'wss://ws.dublup.io',
      CHAT_API: 'https://beechat.hive-engine.com/api',
      CHAT_WS: 'wss://ws.beechat.hive-engine.com',
      CHAT_CHANNELS: ['01EPB6A2PPSW0BQVJ7WDDP568C', '01EVQS8BT5X4T29CGQDGR14CXN']
    }
  }]
}
