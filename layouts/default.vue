<template>
  <div>
    <Header />

    <div class="container mt-5">
      <Nuxt />
    </div>

    <notifications :duration="15000" />
    <Footer />
    <Login />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import Login from '@/components/modals/Login.vue'

export default {
  name: 'Layout',

  components: {
    Header,
    Footer,
    Login
  },

  data () {
    return {
      socket: null,
      websocketConnected: false,
      reconnectInterval: 1000
    }
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated', 'token'])
  },

  watch: {
    isAuthenticated (authenticated) {
      if (authenticated) {
        this.connectWebsocket()

        this.websocketSend({ type: 'authenticate', payload: { token: this.token } })
      } else {
        this.disconnectWebsocket('User logged out')
      }
    },

    websocketConnected (connected) {
      if (connected && this.socket.readyState === 1 && this.isAuthenticated) {
        this.websocketSend({ type: 'authenticate', payload: { token: this.token } })
      }
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on('SHOW_LOADING_SCREEN', () => {
      self.showLoadingOverlay()
    })

    this.$eventBus.$on('HIDE_LOADING_SCREEN', () => {
      self.hideLoadingOverlay()
    })
  },

  beforeDestroy () {
    this.disconnectWebsocket()
  },

  methods: {
    ...mapActions(['fetchSettings']),
    ...mapActions('user', ['fetchNotifications']),

    async notifications () {
      if (this.isAuthenticated) {
        await this.fetchNotifications()
      }
    },

    connectWebsocket () {
      this.disconnectWebsocket()

      this.socket = new WebSocket(this.$config.WS_SERVER)

      this.socket.onopen = (event) => {
        console.log('Connected to the socket')

        this.reconnectInterval = 1000
        this.websocketConnected = true
      }

      this.socket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        this.processMessage(message)
      }

      this.socket.onerror = (event) => {
        //
      }

      this.socket.onclose = (event) => {
        this.websocketConnected = false

        if (event.code !== 1000) {
          const self = this
          const maxReconnectInterval = 3000

          setTimeout(() => {
            if (this.reconnectInterval < maxReconnectInterval) {
              this.reconnectInterval += 1000
            }

            self.connectWebsocket()
          }, this.reconnectInterval)
        }
      }
    },

    disconnectWebsocket (message = '') {
      if (this.socket) {
        this.socket.close(1000, message)
        this.socket = null
      }
    },

    websocketSend (message) {
      if (this.socket && this.socket.readyState === 1) {
        this.socket.send(JSON.stringify(message))
      }
    },

    processMessage (message) {
      if (message.type === 'register-oracle') {
        this.$notify({
          title: 'Oracle Registration',
          type: 'success',
          text: 'You have successfully registered as an oracle.'
        })

        this.$eventBus.$emit('register-oracle-notification')
      }

      if (message.type === 'create-market') {
        const payload = JSON.parse(message.payload)

        this.$notify({
          title: 'Market Creation',
          type: payload.success ? 'success' : 'error',
          text: payload.message
        })

        this.$eventBus.$emit('create-market-notification', payload)
      }

      if (message.type === 'buy-shares') {
        const payload = JSON.parse(message.payload)

        this.$notify({
          title: 'Buy Shares',
          type: payload.success ? 'success' : 'error',
          text: payload.message || 'Shares purchase has failed.'
        })

        this.$eventBus.$emit('buy-shares-notification', payload)
      }

      if (message.type === 'report-outcome') {
        const payload = JSON.parse(message.payload)

        this.$notify({
          title: 'Settle Market',
          type: payload.success ? 'success' : 'error',
          text: payload.success ? 'Market outcome reporting has been successful.' : 'Market outcome reporting has failed.'
        })

        this.$eventBus.$emit('report-outcome-notification', payload)
      }

      if (message.type === 'hide-market') {
        const payload = JSON.parse(message.payload)

        this.$notify({
          title: 'Hide Market',
          type: payload.success ? 'success' : 'error',
          text: payload.success ? 'Market is now hidden.' : 'Hiding market has failed.'
        })

        this.$eventBus.$emit('hide-market-notification', payload)
      }
    }
  },

  timers: {
    fetchSettings: { time: 10 * 60 * 1000, autostart: true, immediate: false, repeat: true },
    notifications: { time: 60 * 1000, autostart: true, immediate: true, repeat: true }
  }
}
</script>
