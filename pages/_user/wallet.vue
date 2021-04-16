<template>
  <div class="wallet">
    <template v-if="dataLoaded">
      <h3>Wallet</h3><hr>

      <b-table responsive striped :items="wallet" :fields="fields">
        <template #cell(actions)="{item}">
          <template v-if="item.token === 'SWAP.HIVE'">
            <b-button variant="primary" @click.prevent="$bvModal.show('depositHEModal')">
              Deposit
            </b-button>

            <b-button variant="primary" @click.prevent="$bvModal.show('withdrawHEModal')">
              Withdraw
            </b-button>
          </template>

          <template v-else-if="item.token === settings.currency">
            <b-button variant="primary" @click.prevent="$bvModal.show('convertModal')">
              Get {{ settings.currency }}
            </b-button>
          </template>
        </template>
      </b-table>
    </template>

    <b-modal id="depositHEModal" title="Deposit">
      <b-form-group label="Current Balance">
        <div class="form-text">
          {{ quoteBalance }} {{ quoteSymbol }}
        </div>
      </b-form-group>

      <b-form-group label="Amount">
        <b-input-group append="HIVE">
          <b-form-input
            v-model.number="depositHEAmount"
            type="number"
            step="any"
            placeholder="100.000"
            required
          />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="primary" :disabled="depositHEAmount <= 0" @click="requestHEDeposit(depositHEAmount)">
          Deposit HIVE
        </b-button>
      </template>
    </b-modal>

    <b-modal id="withdrawHEModal" title="Withdraw">
      <b-form-group label="Available Balance">
        <div class="form-text">
          <a href="#" @click.prevent="withdrawHEAmount = quoteBalance">{{ quoteBalance }} {{ quoteSymbol }}</a>
        </div>
      </b-form-group>

      <b-form-group label="Amount">
        <b-input-group :append="quoteSymbol">
          <b-form-input
            v-model.number="withdrawHEAmount"
            type="number"
            step="any"
            placeholder="100.000"
            required
          />
        </b-input-group>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="primary" :disabled="withdrawHEAmount <= 0 || withdrawHEAmount > quoteBalance" @click="requestHEWithdrawal(withdrawHEAmount)">
          Withdraw {{ quoteSymbol }}
        </b-button>
      </template>
    </b-modal>

    <b-modal id="convertModal" :title="`Convert to and from ${settings.currency}`">
      <b-form-row>
        <b-col>
          <b-form-group :label="`${baseSymbol}`">
            <b-form-text>{{ baseBalance }}</b-form-text>
          </b-form-group>
        </b-col>

        <b-col>
          <b-form-group :label="`${quoteSymbol}`">
            <b-form-text>{{ quoteBalance }}</b-form-text>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-group label="From">
        <b-input-group>
          <b-form-input
            v-model.number="fromAmount"
            type="number"
            min="0.001"
            step="any"
            @input="fromAmountActive = true; toAmountActive = false"
            @change="fromAmountActive = true; toAmountActive = false"
          />

          <template #append>
            <b-form-select v-model="fromSymbol" :options="[quoteSymbol, baseSymbol]" />
          </template>
        </b-input-group>
      </b-form-group>

      <b-form-group label="To">
        <b-input-group>
          <b-form-input
            v-model.number="toAmount"
            type="number"
            min="0.001"
            step="any"
            @input="toAmountActive = true; fromAmountActive = false"
            @change="toAmountActive = true; fromAmountActive = false"
          />

          <template #append>
            <b-form-select v-model="toSymbol" :options="[quoteSymbol, baseSymbol]" />
          </template>
        </b-input-group>
      </b-form-group>

      <b-form-group v-if="poolInfo && fromAmount >0 && toAmount > 0" label="Price">
        <b-form-text>
          <div class="mb-1">
            {{ toFixedWithoutRounding(getExactInputPrice(fromSymbol, fromAmount) / fromAmount, poolInfo.precision) }} {{ toSymbol }}/{{ fromSymbol }}
          </div>

          <div class="mb-1">
            {{ toFixedWithoutRounding(getExactOutputPrice(toSymbol, toAmount) / toAmount, poolInfo.precision) }} {{ fromSymbol }}/{{ toSymbol }}
          </div>

          <div class="font-italic">
            * Price shown here is an estimate, actual amount received may vary depending on market condition.
          </div>
        </b-form-text>
      </b-form-group>

      <template #modal-footer>
        <b-button variant="primary" :disabled="fromAmount <= 0 || balances.get(fromSymbol) <= fromAmount" @click.prevent="swapTokens">
          Convert
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Wallet',

  middleware: 'authenticated',

  data () {
    return {
      dataLoaded: null,
      balances: new Map(),
      coins: [],
      fields: [
        { key: 'token', label: 'TOKEN' },
        { key: 'balance', label: 'BALANCE' },
        { key: 'actions', label: '' }
      ],
      depositHEAmount: 0,
      withdrawHEAmount: 0,
      quoteBalance: 0,
      baseBalance: 0,
      baseSymbol: '',
      quoteSymbol: '',
      fromAmount: '',
      fromSymbol: '',
      toAmount: '',
      toSymbol: '',
      poolInfo: {},

      fromAmountActive: false,
      toAmountActive: false
    }
  },

  async fetch () {
    this.dataLoaded = false

    const [baseSymbol, quoteSymbol] = this.settings.marketpools_pair.split(':')

    this.baseSymbol = baseSymbol
    this.quoteSymbol = quoteSymbol

    this.coins = [baseSymbol, quoteSymbol]

    await this.fetchHEBalances()

    this.dataLoaded = true
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username']),

    wallet () {
      return this.coins.map((c) => {
        return {
          token: c,
          balance: this.balances.get(c) || 0
        }
      })
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
    },

    fromSymbol (v) {
      this.toSymbol = (v === this.quoteSymbol) ? this.baseSymbol : this.quoteSymbol
    },

    toSymbol (v) {
      this.fromSymbol = (v === this.quoteSymbol) ? this.baseSymbol : this.quoteSymbol
    },

    fromAmount (v) {
      if (this.fromAmountActive && this.poolInfo.basePrice) {
        const price = this.getExactInputPrice(this.fromSymbol, v)
        this.toAmount = this.roundHalfUp(price)
      }
    },

    toAmount (v) {
      if (this.toAmountActive && this.poolInfo.basePrice) {
        const price = this.getExactOutputPrice(this.toSymbol, v)
        this.fromAmount = this.roundHalfUp(price)
      }
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on(['he-deposit-request-successful', 'he-withdrawal-request-successful', 'he-swap-request-successful'], async () => {
      self.$bvModal.hide('depositHEModal')
      self.$bvModal.hide('withdrawHEModal')
      self.$bvModal.hide('convertModal')

      self.dataLoaded = false

      await self.sleep(10 * 1000)

      await self.$fetch()
    })

    this.$root.$on('bv::modal::show', async (bvEvent, modalId) => {
      if (modalId === 'depositModal') {
        await self.fetchHEBalances()
      } else if (modalId === 'convertModal') {
        self.fromSymbol = self.baseSymbol
        self.toSymbol = self.quoteSymbol

        self.fromAmount = ''
        self.toAmount = ''

        const [poolInfo] = await Promise.all([
          this.$sidechain.getMarketPools({ tokenPair: self.settings.marketpools_pair }),
          this.fetchHEBalances()
        ])

        this.poolInfo = poolInfo[0]
      }
    })
  },

  beforeDestroy () {
    this.$eventBus.$off(['he-deposit-request-successful', 'he-withdrawal-request-successful', 'he-swap-request-successful'])
    this.$root.$off('bv::modal::show')
  },

  methods: {
    ...mapActions('user', ['requestHEDeposit', 'requestHEWithdrawal', 'requestSwapTokens']),

    async fetchHEBalances () {
      const query = await this.$sidechain.getBalances(this.username, { $in: this.coins })

      this.balances = new Map(query.map(b => [b.symbol, Number(b.balance)]))

      this.quoteBalance = this.balances.get(this.quoteSymbol) || 0
      this.baseBalance = this.balances.get(this.baseSymbol) || 0
    },

    roundHalfUp (number, precision = 3) {
      const sign = Math.sign(number)
      const power = 10 ** precision

      return sign * Math.round(Math.abs(number) * power) / power
    },

    getExactInputPrice (symbol, value) {
      const price = (symbol === this.baseSymbol)
        ? (value * Number(this.poolInfo.quoteQuantity)) / (Number(this.poolInfo.baseQuantity) + value)
        : (value * Number(this.poolInfo.baseQuantity)) / (Number(this.poolInfo.quoteQuantity) + value)
      return price
    },

    getExactOutputPrice (symbol, value) {
      const price = (symbol === this.baseSymbol)
        ? (value * Number(this.poolInfo.quoteQuantity)) / (Number(this.poolInfo.baseQuantity) - value)
        : (value * Number(this.poolInfo.baseQuantity)) / (Number(this.poolInfo.quoteQuantity) - value)
      return price
    },

    swapTokens () {
      this.requestSwapTokens({ tokenPair: this.poolInfo.tokenPair, tokenSymbol: this.fromSymbol, tokenAmount: this.fromAmount })
    }
  }
}
</script>

<style>

</style>
