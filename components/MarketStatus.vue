<template>
  <b-badge class="market-status-badge" :class="getMarketStatus.replace(' ', '-').toLowerCase()">
    {{ getMarketStatus }}
  </b-badge>
</template>

<script>
export default {
  name: 'MarketStatus',

  props: {
    status: { type: Number, required: true }
  },

  computed: {
    getMarketStatus () {
      return (this.status === 0) ? 'Hidden' : (this.status === 1) ? 'Market Open' : (this.status === 2) ? 'Market Closed' : (this.status === 3) ? 'Reporting' : (this.status === 4) ? 'Reported' : 'Finalized'
    }
  }
}
</script>

<style lang="scss" scoped>
.market-status-badge {
  font-size: 14px;
  border: none;
  vertical-align: middle
}
</style>
