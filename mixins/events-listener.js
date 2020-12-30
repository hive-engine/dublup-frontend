export default {
  mounted () {
    const self = this

    this.$eventBus.$on([
      'buy-shares-successful',
      'sell-shares-successful',
      'cancel-sale-shares-successful',
      'register-oracle-successful'
    ], async () => {
      if (self.resetForm && typeof self.resetForm === 'function') {
        self.resetForm()
      }

      self.dataLoaded = false

      await self.sleep(10 * 1000)

      await self.$fetch()
    })
  },

  beforeDestroy () {
    this.$eventBus.$off([
      'create-market-successful',
      'buy-shares-successful',
      'sell-shares-successful',
      'cancel-sale-shares-successful',
      'register-oracle-successful',
      'register-oracle-notification',
      'create-market-notification',
      'report-outcome-notification',
      'hide-market-notification',
      'buy-shares-notification'
    ])
  }
}
