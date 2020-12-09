<template>
  <div class="search-results">
    <h3>
      Search results for "{{ $route.query.q }}"
    </h3><hr>

    <div v-if="search_results.length >0" class="markets">
      <market-card v-for="(market, i) of search_results" :key="i" :market="market" />

      <b-pagination v-model="currentPage" class="mt-5" align="center" :per-page="perPage" :total-rows="pagination.total" />
    </div>

    <p v-else class="mt-5 mb-5 text-center text-muted">
      No markets found.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import MarketCard from '@/components/cards/Market.vue'

export default {
  name: 'Search',

  components: {
    MarketCard
  },

  data () {
    return {
      currentPage: 1,
      perPage: 20
    }
  },

  async fetch () {
    const query = { q: this.$route.query.q }
    const { category, sub_category: subCategory } = this.$route.query

    if (category) { query.category = category }
    if (category && subCategory) { query.sub_category = subCategory }

    query.page = this.currentPage
    query.limit = this.perPage

    await this.fetchSearchResults(query)
  },

  head () {
    return {
      title: 'Search'
    }
  },

  computed: {
    ...mapGetters('market', ['search_results', 'pagination'])
  },

  watch: {
    '$route.query': {
      handler () {
        this.currentPage = 1
        this.$fetch()
      }
    },

    currentPage () {
      this.$fetch()
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
    ...mapActions('market', ['fetchSearchResults'])
  }
}
</script>

<style lang="scss">
</style>
