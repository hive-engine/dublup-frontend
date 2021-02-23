import { zonedTimeToUtc } from 'date-fns-tz'

import Vue from 'vue'

if (!Vue.__myGlobalMixin__) {
  Vue.__myGlobalMixin__ = true

  Vue.mixin({
    data () {
      return {
        loading: false
      }
    },

    methods: {
      showLoadingOverlay () {
        // if (!this.loadingOverlay) {
        this.loadingOverlay = this.$loading.show({
          programmatic: true,
          container: null,
          canCancel: false,
          loader: 'dots',
          color: '#90c2f9',
          width: 100,
          height: 100,
          opacity: 0.9
        })
        // }
      },

      hideLoadingOverlay () {
        if (this.loadingOverlay) {
          this.loadingOverlay.hide()
        }
      },

      toFixedWithoutRounding (t, l = 3) {
        const a = 10 ** l
        const s = t * a
        return Math.trunc(s) / a
      },

      scrollToTop (top = 0) {
        if (!process.client) { return }

        window.scroll({
          top,
          left: 0,
          behavior: 'smooth'
        })
      },

      sleep (ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      },

      convertDateTime (date, time = '00:00:00', timezone = 'Etc/GMT') {
        return zonedTimeToUtc(`${date} ${time}`, timezone)
      }
    }
  })
}
