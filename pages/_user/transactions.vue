<template>
  <div class="container">
    <h3>Transactions</h3><hr>

    <div v-if="transactions.length >0" class="mt-3">
      <b-row>
        <b-col
          offset-sm="7"
          sm="5"
          offset-md="8"
          md="4"
          offset-lg="9"
          lg="3"
        >
          <b-form-select v-model="types" :options="filterOptions" />
        </b-col>
      </b-row>

      <ul class="list-unstyled mt-5">
        <li v-for="(transaction, i) of transactions" :key="i" class="mb-3 pb-2 border-bottom">
          You have
          <template v-if="transaction.type === 'create-market'">
            created a new market. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.market_id}}">
              {{ transaction.market_id }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'buy-shares'">
            been issued <code>{{ transaction.data.quantity }} SHARES</code>. Outcome: {{ transaction.data.outcome }}. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.data.market}}">
              {{ transaction.data.market }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'creator-reward'">
            received <code>{{ transaction.data.quantity }} {{ transaction.data.symbol }}</code> market creator reward. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.data.market}}">
              {{ transaction.data.market }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'reward'">
            received <code>{{ transaction.data.quantity }} {{ transaction.data.symbol }}</code> market participation reward. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.data.market}}">
              {{ transaction.data.market }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'oracle-reward'">
            received <code>{{ transaction.data.quantity }} {{ transaction.data.symbol }}</code> market oracle reward. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.data.market}}">
              {{ transaction.data.market }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'market-buy'">
            <template v-if="transaction.account === $route.params.user">
              bought <code>{{ transaction.data.nfts.length }} SHARES</code> from <nuxt-link :to="{name: 'user-markets', params:{user: transaction.counterparty}}">
                @{{ transaction.counterparty }}
              </nuxt-link>
            </template>

            <template v-else>
              sold <code>{{ transaction.data.nfts.length }} SHARES</code> to <nuxt-link :to="{name: 'user-markets', params:{user: transaction.account}}">
                @{{ transaction.account }}
              </nuxt-link>
            </template>
            for <code>{{ transaction.data.payment }} {{ transaction.data.symbol }}</code>. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.market_id}}">
              {{ transaction.market_id }}
            </nuxt-link>
          </template>

          <template v-else-if="transaction.type === 'register-oracle'">
            registered as an oracle.
          </template>

          <template v-else-if="transaction.type === 'hide-market'">
            hidden a market. Market ID: <nuxt-link :to="{name:'market-market', params: {market: transaction.market_id}}">
              {{ transaction.market_id }}
            </nuxt-link>
          </template>

          <br>
          <timeago class="text-muted" :datetime="new Date(transaction.timestamp)" :auto-update="60" />
          <a
            class="small"
            :href="`${(transaction.sidechain_block) ? $config.EXPLORER_URL: 'https://hiveblocks.com'}/tx/${transaction.trx_id}`"
            target="_blank"
          >[view tx]</a>
        </li>
      </ul>
    </div>

    <p v-else class="mt-5">
      No transactions has been found.
    </p>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Transactions',

  data () {
    return {
      dataLoaded: null,
      filterOptions: [
        { value: null, text: 'All Transactions' },
        { value: 'buy-shares', text: 'Shares Purchase' },
        { value: 'market-buy', text: 'Market Buy/Sales' },
        { value: 'creator-reward', text: 'Creator Reward' },
        { value: 'oracle-reward', text: 'Oracle Rewards' },
        { value: 'reward', text: 'Participation Reward' },
        { value: 'create-market', text: 'Market Creation' }
      ],
      types: null
    }
  },

  async fetch () {
    await this.fetchFilteredTransactions()
  },

  head () {
    return {
      title: 'Transactions'
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username']),
    ...mapGetters('transaction', ['transactions'])
  },

  watch: {
    dataLoaded: {
      deep: true,
      handler (value) {
        if (value === false || value === null) {
          this.showLoadingOverlay()
        } else {
          this.hideLoadingOverlay()
        }
      }
    },

    async types (value) {
      const query = {}

      if (value) {
        query.types = value
      }

      await this.fetchFilteredTransactions(query)
    }
  },

  methods: {
    ...mapActions('transaction', ['fetchTransactions']),

    async fetchTransactionData (trx) {
      await this.$API.call('transactions/history', { username: 'codebull' })

      return trx
    },

    async fetchFilteredTransactions (query) {
      this.dataLoaded = false

      await this.fetchTransactions({ username: this.$route.params.user, ...query })

      this.dataLoaded = true
    }
  }
}
</script>

<style>

</style>
