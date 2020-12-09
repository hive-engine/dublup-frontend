import Vue from 'vue'
import Websocket from '@/services/websocket'

export default ({ store, $config }, inject) => {
  Vue.use(Websocket, {
    url: $config.WS_SERVER,
    store
  })

  const vm = new Vue()

  inject('socket', vm)
}
