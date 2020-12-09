<template>
  <div class="search-results">
    <h3>
      Admin Panel
    </h3><hr>

    <b-card title="Hide Market" title-tag="h5">
      <b-form-group label="Market ID">
        <b-input-group>
          <b-form-input v-model="marketId" type="text" name="marketId" />

          <template #append>
            <b-button :disabled="marketId.length < 26" variant="primary" @click.prevent="fetchmarketInfo">
              Find
            </b-button>
          </template>
        </b-input-group>
      </b-form-group>

      <template v-if="market">
        <hr>
        <h6>Question: {{ market.question }} <market-status :status="market.status" /></h6>
        <ul class="list-inline">
          <li class="list-inline-item">
            Creator: @{{ market.creator }}
          </li>
          <li class="list-inline-item">
            Category: {{ market.category }}
          </li>
          <li class="list-inline-item">
            Sub-Category: {{ market.sub_category }}
          </li>
        </ul>

        <b-button :to="{name:'market-market', params:{market: market.id}}">
          View
        </b-button>

        <b-button v-if="market.status === 1" variant="danger" @click.prevent="requestHideMarket(market.id)">
          Hide
        </b-button>
      </template>
    </b-card>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import MarketStatus from '@/components/MarketStatus.vue'

export default {
  name: 'AdminPanel',

  components: {
    MarketStatus
  },

  middleware: 'admin',

  data () {
    return {
      marketId: ''
    }
  },

  computed: {
    ...mapGetters('admin', ['market'])
  },

  mounted () {
    const self = this

    this.$eventBus.$on('hide-market-notification', () => {
      self.SET_MARKET_DATA(null)
    })
  },

  methods: {
    ...mapMutations('admin', ['SET_MARKET_DATA']),
    ...mapActions('admin', ['fetchMarket', 'requestHideMarket']),

    async fetchmarketInfo () {
      await this.fetchMarket(this.marketId)
    }
  }
}
</script>

<style>

</style>
