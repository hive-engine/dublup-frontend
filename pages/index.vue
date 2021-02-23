<template>
  <div class="home">
    <div class="promo-img-full">
      <div class="promo-img-logo">
        <img src="/dublup_final_logo_whitefont-600.png" height="600" width="600" alt="Dublup">
      </div>
      <div class="promo-img-text">
        <div class="line1">
          <h1>Win Cryptocurrency</h1>
        </div>
        <div class="line2">
          By Correctly Predicting Future Events!
        </div>
        <div class="line3">
          Powered by the <a href="https://hiveonboard.com/?ref=dublup" target="_blank">HIVE Blockchain</a> <img src="/hive-logo.png" width="200" height="" class="hive-logo">
        </div>
      </div>
    </div>
    <template v-if="markets.length > 0">
      <b-row align-h="end">
        <b-col cols="6" md="4" lg="3">
          <b-form-select v-model="sortBy" :options="sortOptions" />
        </b-col>
      </b-row>

      <div class="markets mt-4">
        <market-card v-for="(market, i) of markets" :key="i" :market="market" />
        <div class="pagination-container">
          <b-pagination v-model="currentPage" class="mt-5" align="center" :per-page="perPage" :total-rows="pagination.total" />
        </div>
      </div>
    </template>

    <p v-else class="mt-5 mb-5 text-center text-muted">
      No markets found.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MarketCard from '@/components/cards/Market.vue'

export default {
  name: 'Home',

  components: {
    MarketCard
  },

  data () {
    return {
      currentPage: 1,
      perPage: 20,
      sortBy: 'liquidity',
      sortOptions: [
        { value: 'liquidity', text: 'Liquidity' },
        { value: 'newest', text: 'Newest' },
        { value: 'oldest', text: 'Oldest' },
        { value: 'ending_soon', text: 'Ending Soon' }
      ]
    }
  },

  async fetch () {
    const query = {}
    const { category, sub_category: subCategory, page, sort_by: sortBy } = this.$route.query

    if (category) { query.category = category }
    if (category && subCategory) { query.sub_category = subCategory }

    if (sortBy) { query.sort_by = sortBy }

    if (page) { query.page = page }

    query.limit = this.perPage

    await this.fetchMarkets(query)
  },

  computed: {
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

    sortBy () {
      this.$router.push({ query: { ...this.$route.query, sort_by: this.sortBy } })
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

  methods: {
    ...mapActions('market', ['fetchMarkets'])
  }
}
</script>

<style lang="scss">

</style>
