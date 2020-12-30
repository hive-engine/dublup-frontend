<template>
  <div class="reporting-center">
    <h3>Reporting Center</h3><hr>

    <div v-if="markets.length > 0" class="markets">
      <market-card v-for="(market, i) of markets" :key="i" :market="market" :pending="$fetchState.pending" />

      <b-pagination v-model="currentPage" class="mt-5" align="center" :per-page="perPage" :total-rows="pagination.total" />
    </div>

    <p v-else class="mt-5 mb-5 text-center text-muted">
      No markets found for reporting.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MarketCard from '@/components/cards/Market.vue'

export default {
  name: 'Report',

  components: {
    MarketCard
  },

  middleware: 'oracle',

  data () {
    return {
      currentPage: 1,
      perPage: 20
    }
  },

  async fetch () {
    const query = { status: 3, oracle: this.username }
    const { category, sub_category: subCategory, page } = this.$route.query

    if (category) { query.category = category }
    if (category && subCategory) { query.sub_category = subCategory }

    if (page) { query.page = page }

    query.limit = this.perPage

    await this.fetchMarkets(query)
  },

  head () {
    return {
      title: 'Reporting'
    }
  },

  computed: {
    ...mapGetters('user', ['username']),
    ...mapGetters('market', ['markets', 'pagination'])
  },

  watch: {
    '$route.query': {
      handler (v, o) {
        if (v.category && v.category !== o.category) {
          this.currentPage = 1
        }

        if (v.sub_category && v.sub_category !== o.sub_category) {
          this.currentPage = 1
        }

        this.$fetch()
      }
    },

    currentPage (v) {
      this.$router.push({ query: { ...this.$route.query, page: this.currentPage } })
    },

    '$fetchState.pending': {
      handler (v) {
        if (v) {
          this.showLoadingOverlay()
        } else {
          this.hideLoadingOverlay()
        }
      }
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on('register-oracle-notification', async () => {
      await self.$fetch()
    })
  },

  methods: {
    ...mapActions('market', ['fetchMarkets'])
  }
}
</script>

<style>

</style>
