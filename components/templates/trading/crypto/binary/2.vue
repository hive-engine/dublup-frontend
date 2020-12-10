<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Will the price of
        <b-form-select
          v-model="pair"
          class="inline-input"
          :options="pairOptions"
          :state="$v.pair.$dirty ? !$v.pair.$error : null"
        />
        exceed
        <b-form-input
          v-model.number="price"
          class="inline-input"
          type="number"
          placeholder="Price #"
          :state="$v.price.$dirty ? !$v.price.$error : null"
        />
        anytime between the open of
        <b-form-datepicker
          v-model="openDate"
          width="200px"
          hide-header
          class="inline-input"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :min="openDateMin"
          :max="openDateMax"
          :state="$v.openDate.$dirty ? !$v.openDate.$error : null"
        />
        and close of
        <b-form-datepicker
          v-model="closeDate"
          width="200px"
          hide-header
          class="inline-input"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :min="closeDateMin"
          :max="closeDateMax"
          :state="$v.closeDate.$dirty ? !$v.closeDate.$error : null"
        />
        according to TradingView.com
        <b-form-select
          v-model="source"
          class="inline-input"
          :options="marketSource"
          :state="$v.source.$dirty ? !$v.source.$error : null"
        />?
      </div>
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        This templated market has a predefined event expiration date, which is 1
        days after close date in market question.
      </p>

      <b-form-row>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-datepicker
            v-model="expiryDate"
            hide-header
            :disabled="true"
            :date-format-options="{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }"
          />
        </b-col>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-timepicker
            v-model="expiryTime"
            hide-header
            :hour12="true"
            menu-class="w-100"
            :no-close-button="true"
            :disabled="true"
          />
        </b-col>

        <b-col cols="12" class="mb-3">
          We will be using the UTC-0 timezone to standarise times. Ensure the
          UTC-0 time is accurate and does not conflict with the resolution start
          time.
        </b-col>
      </b-form-row>

      <h5 class="mt-4 mb-3">
        Added resolution rules
      </h5>
      <ResolutionRules :template="template" />
    </b-card>
  </div>
</template>

<script>
import { addDays, addMonths } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { required, minValue } from 'vuelidate/lib/validators'
import ResolutionRules from '@/components/ResolutionRules.vue'

export default {
  name: 'TradingCryptoBinaryQuestionTwo',

  components: {
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      pair: null,
      pairOptions: [
        { value: null, text: 'Token Pair' },
        {
          label: 'Bitcoin (BTC)',
          options: [
            { value: 'BTC-USD', text: 'BTC-USD' },
            { value: 'BTC-EUR', text: 'BTC-EUR' },
            { value: 'BTC-USDT', text: 'BTC-USDT' }
          ]
        },
        {
          label: 'Ethereum (ETH)',
          options: [
            { value: 'ETH-USD', text: 'ETH-USD' },
            { value: 'ETH-EUR', text: 'ETH-EUR' },
            { value: 'ETH-USDT', text: 'ETH-USDT' }
          ]
        }
      ],
      price: '',
      openDate: null,
      closeDate: null,
      source: null,
      sourceOptions: {
        'BTC-USD': ['BTCUSD (crypto - Bitfinex)', 'BTCUSD (crypto - Bittrex)', 'BTCUSD (crypto - Coinbase)'],
        'BTC-EUR': ['BTCEUR (crypto - Bitfinex)', 'BTCEUR (crypto - Coinbase)'],
        'BTC-USDT': ['BTCUSDT (crypto - Binance)', 'BTCUSDT (crypto - Bittrex)'],

        'ETH-USD': ['ETHUSD (crypto - Bitfinex)', 'ETHUSD (crypto - Bittrex)', 'ETHUSD (crypto - Coinbase)'],
        'ETH-EUR': ['ETHEUR (crypto - Bitfinex)', 'ETHEUR (crypto - Coinbase)'],
        'ETH-USDT': ['ETHUSDT (crypto - Binance)', 'ETHUSDT (crypto - Bittrex)']
      }
    }
  },

  computed: {
    marketSource () {
      const options = [{ value: null, text: 'Market Source' }]
      if (!this.pair) {
        return options
      } else {
        return [...options, ...this.sourceOptions[this.pair]]
      }
    },

    expiryDate () {
      if (this.closeDate) {
        return format(addDays(utcToZonedTime(this.closeDate, 'Etc/GMT'), 1), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.closeDate) {
        return '00:00'
      }

      return null
    },

    openDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    openDateMax () {
      return format(addMonths(new Date(), 3), 'yyyy-MM-dd')
    },

    closeDateMin () {
      return format(new Date(this.openDate), 'yyyy-MM-dd')
    },

    closeDateMax () {
      return format(addMonths(new Date(this.openDate), 3), 'yyyy-MM-dd')
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate, this.expiryTime)
      }

      return null
    }
  },

  methods: {
    validate () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      if (isValid) {
        const data = {
          pair: this.pair,
          price: this.price,
          openDate: this.convertDateTime(this.openDate).toISOString(),
          closeDate: this.convertDateTime(this.closeDate).toISOString(),
          source: this.source,
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    pair: {
      required
    },

    price: {
      required,
      minValue: minValue(1)
    },

    openDate: {
      required
    },

    closeDate: {
      required,
      mustBeEqualOrHigher (value) {
        if (value === '') {
          return true
        }

        return new Date(value) >= new Date(this.openDate)
      }
    },

    source: {
      required
    },

    form: ['pair', 'price', 'openDate', 'closeDate', 'source']
  }
}
</script>

<style>
</style>
