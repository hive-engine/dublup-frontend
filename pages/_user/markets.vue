<template>
  <div class="user-markets">
    <h3>
      Markets by <nuxt-link :to="{name:'user-markets', params:{user:$route.params.user}}">
        @{{ $route.params.user }}
      </nuxt-link>
    </h3><hr>

    <template v-if="markets.length > 0">
      <b-row align-h="end">
        <b-col cols="6" md="4" lg="3">
          <b-form-select v-model="sortBy" :options="sortOptions" />
        </b-col>
      </b-row>

      <div class="markets mt-4">
        <market-card v-for="(market, i) of markets" :key="i" :market="market" route="user-markets" />

        <b-pagination v-model="currentPage" class="mt-5" align="center" :per-page="perPage" :total-rows="pagination.total" />
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
  name: 'UserMarkets',

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
        { value: 'oldest', text: 'Oldest' },
        { value: 'ending_soon', text: 'Ending Soon' }
      ]
    }
  },

  async fetch () {
    const query = { creator: this.$route.params.user }
    const { category, sub_category: subCategory, page, sort_by: sortBy } = this.$route.query

    if (category) { query.category = category }
    if (category && subCategory) { query.sub_category = subCategory }

    if (sortBy) {
      query.sort_by = sortBy
    } else {
      query.sort_by = this.sortBy
    }

    if (page) { query.page = page }

    query.limit = this.perPage

    await this.fetchMarkets(query)
  },

  head () {
    return {
      title: `Markets by @${this.$route.params.user}`
    }
  },

  computed: {
    ...mapGetters('market', ['markets', 'pagination'])
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

  mounted () {
    const self = this

    this.$eventBus.$on(['create-market-notification'], async () => {
      await self.$fetch()
    })
  },

  methods: {
    ...mapActions('market', ['fetchMarkets'])
  }
}
</script>

<style lang="scss">
</style>
