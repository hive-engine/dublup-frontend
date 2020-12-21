<template>
  <div class="market-page">
    <template v-if="dataLoaded">
      <h1 class="h3">
        {{ market.question }} <market-status :status="market.status" />
      </h1><hr>

      <ul class="list-inline">
        <li class="list-inline-item">
          Creator: <nuxt-link :to="{name:'user-markets', params:{user:market.creator}}">
            @{{ market.creator }}
          </nuxt-link>
        </li>
        <li class="list-inline-item">
          Category: <nuxt-link :to="{name:'index', query:{category: market.category}}">
            {{ market.category }}
          </nuxt-link>
        </li>
        <li class="list-inline-item">
          Sub-category: <nuxt-link :to="{name:'index', query:{category: market.category, sub_category: market.sub_category}}">
            {{ market.sub_category }}
          </nuxt-link>
        </li>
      </ul>

      <b-alert :show="market.status === 2" variant="info">
        <div class="d-flex justify-content-between">
          <div class="p-2">
            Market is in reporting state. You can not buy new shares.
          </div>
          <b-button v-if="isOracle" class="float-right" variant="warning" @click.prevent="$bvModal.show('reportingModal')">
            Report
          </b-button>
        </div>
      </b-alert>

      <b-alert :show="market.status === 5" variant="success">
        Reported winning outcome by the Oracles: <strong>{{ market.outcome }}</strong>
      </b-alert>

      <b-row>
        <b-col cols="12" sm="6">
          <h5 class="mt-3">
            Date Created
          </h5><hr>

          <p>
            {{ format(new Date(market.created_at), "MMMM dd, yyyy hh:mm aa") }}
            (UTC-0)
          </p>

          <h5 class="mt-3">
            Event Expiration
          </h5><hr>

          <p>
            {{ format(new Date(market.expires_at), "MMMM dd, yyyy hh:mm aa") }}
            (UTC-0)
          </p>
        </b-col>

        <b-col cols="12" sm="6">
          <h5 class="mt-3">
            Buy Shares
          </h5><hr>

          <b-form-group label="Outcome">
            <b-form-select
              v-model="outcome"
              :options="[{value:null, text:'Select an outcome'},...Object.keys(market.possible_outcomes)]"
              :state="$v.outcome.$dirty ? !$v.outcome.$error : null"
            />
          </b-form-group>

          <b-form-group label="Quantity">
            <b-input-group>
              <b-form-input v-model.number="quantity" type="number" step="1" min="1" :state="$v.quantity.$dirty ? !$v.quantity.$error : null" />

              <template #append>
                <b-input-group-text>SHARES</b-input-group-text>
              </template>
            </b-input-group>
          </b-form-group>

          <b-form-group label="Price / Share">
            <b-input-group>
              <b-form-input :value="market.share_price.amount" type="number" disabled />

              <template #append>
                <b-input-group-text>{{ settings.currency }}</b-input-group-text>
              </template>
            </b-input-group>
          </b-form-group>

          <b-form-group label="Total Price">
            <b-input-group>
              <b-form-input :value="getTotalPrice" type="number" disabled />

              <template #append>
                <b-input-group-text>{{ settings.currency }}</b-input-group-text>
              </template>
            </b-input-group>
          </b-form-group>

          <b-button variant="primary" :disabled="!isAuthenticated || getTotalPrice > balance.balance || market.status !== 1" @click.prevent="buyShares">
            Buy Shares
          </b-button>
        </b-col>

        <b-col v-if="isAuthenticated" class="mt-5" cols="12">
          <div class="position-relative bg-light p-3">
            <p class="mt-3">
              Your {{ settings.currency }} balance: {{ balance.balance }} {{ settings.currency }}
            </p>

            <div>
              <p>Your shares in the market: {{ getUserShares.length }} SHARES</p>

              <template v-if="getUserShares.length > 0">
                <p>
                  Total <small>(grouped by outcome)</small>: <ul class="m-0 list-inline d-inline">
                    <li v-for="[k, v] of Object.entries(getUserGroupedShares)" :key="k" class="text-muted list-inline-item">
                      {{ k }}: {{ v.length }}
                    </li>
                  </ul>
                </p>

                <p v-if="getUserForSale.length >0">
                  Listed For Sale <small>(grouped by outcome)</small>: <ul class="m-0 list-inline d-inline">
                    <li v-for="[k, v] of Object.entries(getUserGroupedForSale)" :key="k" class="text-muted list-inline-item">
                      {{ k }}: {{ v.length }}
                    </li>
                  </ul>
                </p>

                <b-button variant="primary" size="sm" :disabled="market.status === 5" @click.prevent="$bvModal.show('sellSharesModal')">
                  Sell Shares
                </b-button>
              </template>
              <b-button variant="secondary" class="refresh-button" size="sm" title="Refresh" @click.prevent="$fetch()">
                <v-icon name="refresh-cw" />
              </b-button>
            </div>
          </div>
        </b-col>
      </b-row>

      <h5 class="mt-3">
        Secondary Market
      </h5><hr>

      <b-form-group class="mt-3" label="Filters">
        <b-form-radio-group
          id="market-filter"
          v-model="filter"
          :options="Object.keys(market.possible_outcomes)"
          name="market-filters"
        />
      </b-form-group>

      <b-table
        class="mt-3"
        small
        show-empty
        :current-page="currentPage"
        :per-page="perPage"
        :filter="filter"
        :filter-included-fields="filterOn"
        :sort-by.sync="sortBy"
        :items="for_sale"
        :fields="marketFields"
        @filtered="onFiltered"
      >
        <template #cell(price)="data">
          {{ data.item.price }} {{ data.item.symbol }}
        </template>

        <template #cell(actions)="data">
          <add-to-queue v-if="data.item.account === username" :data="data.item" :items="filteredItems || for_sale" />
        </template>
      </b-table>

      <b-pagination
        v-model="currentPage"
        :total-rows="totalRows"
        :per-page="perPage"
        align="center"
        size="sm"
      />

      <b-row v-if="isAuthenticated">
        <b-col class="mt-3">
          <h6>Actions</h6><hr>

          <template v-if="queue.length >0">
            <b-button variant="primary" @click.prevent="requestCancelSale">
              Cancel Sale
            </b-button>
          </template>

          <p class="text-muted">
            No possible actions found.
          </p>
        </b-col>

        <b-col v-if="market.status !== 5" class="mt-3">
          <h6>Buy From Market</h6><hr>

          <b-form inline>
            <b-form-group>
              <b-form-select
                v-model="filter"
                :options="[{value:null, text:'Outcome'}, ...Object.keys(market.possible_outcomes)]"
                :state="$v.filter.$dirty ? !$v.filter.$error : null"
                class="mb-2 mr-sm-2 mb-sm-0"
              />
            </b-form-group>

            <b-form-group>
              <b-form-input
                v-model.number="buyQuantity"
                type="number"
                step="1"
                min="1"
                :max="getFilteredFoSale.length"
                :state="$v.buyQuantity.$dirty ? !$v.buyQuantity.$error : null"
                class="mb-2 mr-sm-2 mb-sm-0"
              />
            </b-form-group>

            <b-button variant="primary" :disabled="buyQuantity > getFilteredFoSale.length || caculateEstimatedPrice > balance.balance" @click.prevent="buyFromMarket">
              Buy
            </b-button>
          </b-form>

          <p class="text-muted mt-3">
            Estimated total price: {{ caculateEstimatedPrice }} {{ settings.currency }}
          </p>
        </b-col>
      </b-row>

      <h4 class="mt-5">
        Resolution Details
      </h4>
      <ResolutionRules :template="market.template" :rules="market.rules ? market.rules : []" />
    </template>

    <sell-shares-modal />
    <reporting-modal />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { format } from 'date-fns'
import { required, numeric, minValue } from 'vuelidate/lib/validators'
import EventListeners from '@/mixins/events-listener'
import AddToQueue from '@/components/AddToQueue.vue'
import MarketStatus from '@/components/MarketStatus.vue'
import ReportingModal from '@/components/modals/Reporting.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import SellSharesModal from '@/components/modals/SellShares.vue'

export default {
  name: 'MarketPage',

  components: {
    AddToQueue,
    MarketStatus,
    ReportingModal,
    ResolutionRules,
    SellSharesModal
  },

  mixins: [EventListeners],

  data () {
    return {
      dataLoaded: null,
      outcome: null,
      quantity: '',

      buyQuantity: '',

      marketFields: [
        { key: 'nft_id', label: 'ID' },
        { key: 'account', label: 'SELLER', sortable: true },
        { key: 'outcome', label: 'OUTCOME' },
        { key: 'price', label: 'PRICE', sortable: true },
        { key: 'actions', label: '' }
      ],
      filter: '',
      totalRows: 1,
      currentPage: 1,
      perPage: 10,
      sortBy: 'price',
      filterOn: ['outcome'],
      filteredItems: null
    }
  },

  async fetch () {
    this.dataLoaded = false

    await Promise.all([
      this.fetchMarket(this.$route.params.market),
      this.fetchNFTInstances({ 'properties.market': this.$route.params.market }),
      this.fetchForSale({ 'grouping.market': this.$route.params.market })
    ])

    if (this.isAuthenticated) {
      await this.fetchUserTokenBalance()
    }

    this.totalRows = this.for_sale.length

    this.dataLoaded = true
  },

  head () {
    return {
      title: this.market.question
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username', 'balance', 'isAuthenticated', 'isOracle']),
    ...mapGetters('market', ['market', 'instances', 'for_sale', 'queue']),

    getTotalPrice () {
      return this.toFixedWithoutRounding(this.quantity * this.market.share_price.amount, 3)
    },

    getUserShares () {
      const self = this

      if (!this.isAuthenticated) {
        return []
      }

      return this.instances.filter(i => i.account === self.username)
    },

    getUserGroupedShares () {
      return this.getUserShares.reduce((acc, cur) => {
        acc[cur.outcome] = [...acc[cur.outcome] || [], cur]

        return acc
      }, {})
    },

    getUserForSale () {
      const self = this
      if (!this.isAuthenticated) {
        return []
      }

      return this.for_sale.filter(i => i.account === self.username)
    },

    getUserGroupedForSale () {
      return this.getUserForSale.reduce((acc, cur) => {
        acc[cur.outcome] = [...acc[cur.outcome] || [], cur]

        return acc
      }, {})
    },

    getFilteredFoSale () {
      const self = this

      return this.for_sale.filter(s => s.account !== self.username && s.outcome === self.filter)
    },

    caculateEstimatedPrice () {
      const self = this

      if (!this.buyQuantity || !this.filter) {
        return 0
      }

      return this.toFixedWithoutRounding(this.getFilteredFoSale.slice()
        .sort((a, b) => a.price - b.price)
        .slice(0, self.buyQuantity)
        .reduce((acc, cur) => acc + cur.price, 0), 3)
    }
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
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on('report-outcome-successful', async () => {
      self.$bvModal.hide('reportingModal')

      self.dataLoaded = false

      await self.sleep(20 * 1000)

      self.dataLoaded = true

      await self.sleep(1 * 1000)

      self.$router.push({ name: 'report' })
    })
  },

  methods: {
    ...mapActions('user', ['fetchUserTokenBalance']),
    ...mapActions('market', ['fetchMarket', 'requestBuyShares', 'requestBuyFromMarket', 'fetchNFTInstances', 'fetchForSale', 'requestCancelSale']),

    format,

    buyShares () {
      this.$v.buyShares.$touch()

      if (!this.$v.buyShares.$invalid) {
        return this.requestBuyShares({
          market: this.market.id,
          quantity: this.quantity,
          outcome: this.outcome,
          total: this.getTotalPrice
        })
      }
    },

    buyFromMarket () {
      this.$v.buyFromMarket.$touch()

      if (!this.$v.buyFromMarket.$invalid) {
        return this.requestBuyFromMarket({
          quantity: this.buyQuantity,
          outcome: this.filter
        })
      }
    },

    resetForm () {
      this.$v.$reset()

      this.outcome = ''
      this.quantity = ''
      this.buyQuantity = ''
      this.filter = null
    },

    onFiltered (filteredItems) {
      this.filteredItems = filteredItems
      this.totalRows = filteredItems.length
      this.currentPage = 1
    }
  },

  validations: {
    outcome: {
      required
    },

    quantity: {
      required,
      numeric,
      minValue: minValue(1)
    },

    filter: {
      required
    },

    buyQuantity: {
      required,
      numeric,
      minValue: minValue(1)
    },

    buyShares: ['outcome', 'quantity'],

    buyFromMarket: ['filter', 'buyQuantity']
  }
}
</script>

<style>

</style>
