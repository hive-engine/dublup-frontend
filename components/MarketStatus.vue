<template>
  <b-badge :class="getMarketStatus.toLowerCase()">
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
      return (this.status === 0) ? 'Hidden' : (this.status === 1) ? 'Open' : (this.status === 2) ? 'Reporting' : (this.status === 3) ? 'Reported' : (this.status === 4) ? 'Disputing' : 'Finalized'
    }
  }
}
</script>

<style>

</style>
