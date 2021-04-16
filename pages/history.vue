<template>
  <div class="settled-markets">
    <h3>
      Settled Markets
    </h3><hr>

    <b-row align-h="end">
      <b-col cols="6" md="4" lg="3">
        <b-form-select v-model="sortBy" :options="sortOptions" />
      </b-col>
    </b-row>

    <div v-if="markets.length >0" class="markets mt-5">
      <market-card v-for="(market, i) of markets" :key="i" :market="market" />

      <b-pagination v-model="currentPage" class="mt-5" align="center" :per-page="perPage" :total-rows="pagination.total" />
    </div>

    <p v-else class="mt-5 mb-5 text-center text-muted">
      No settled markets found.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MarketCard from '@/components/cards/Market.vue'

export default {
  name: 'History',

  components: {
    MarketCard
  },

  data () {
    return {
      currentPage: 1,
      perPage: 20,
      sortBy: 'newest',
      sortOptions: [
        { value: 'liquidity', text: 'Liquidity' },
        { value: 'newest', text: 'Newest' },
        { value: 'oldest', text: 'Oldest' }
      ]
    }
  },

  async fetch () {
    const query = {
      status: 5,
      sortBy: this.sortBy
    }

    const { category, sub_category: subCategory, page, sort_by: sortBy } = this.$route.query

    if (category) { query.category = category }
    if (category && subCategory) { query.sub_category = subCategory }

    if (sortBy) { query.sort_by = sortBy }

    if (page) { query.page = page }

    query.limit = this.perPage

    await this.fetchMarkets(query)
  },

  head () {
    return {
      title: 'Settled Markets'
    }
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

<style>

</style>
