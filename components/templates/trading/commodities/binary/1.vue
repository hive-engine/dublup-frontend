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
        open at or above
        <b-form-input
          v-model.number="price"
          class="inline-input"
          type="number"
          placeholder="Price #"
          step="any"
          :state="$v.price.$dirty ? !$v.price.$error : null"
        />
        on
        <b-form-datepicker
          v-model="openDate"
          hide-header
          class="inline-input"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :min="startDateMin"
          :max="startDateMax"
          :state="$v.openDate.$dirty ? !$v.openDate.$error : null"
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
        days after start date in market question.
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
          We will be using the UTC-0 timezone to standardize times. Ensure the
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
  name: 'TradingCommoditiesBinaryQuestionOne',

  components: {
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      pair: null,
      price: '',
      openDate: '',
      source: null,

      pairOptions: [
        { value: null, text: 'Commodity' },
        {
          label: 'Gold',
          options: [
            { value: 'XAU-USD', text: 'XAU-USD' }
          ]
        },
        {
          label: 'Silver',
          options: [
            { value: 'XAG-USD', text: 'XAG-USD' }
          ]
        }
      ],
      sourceOptions: {
        'XAU-USD': ['XAUUSD (cfd - OANDA)', 'XAUUSD (cfd - ICE)', 'XAUUSD (cfd - FOREX.com)'],
        'XAG-USD': ['XAGUSD (cfd - OANDA)', 'XAGUSD (cfd - ICE)', 'XAGUSD (cfd - FOREX.com)']
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
      if (this.openDate) {
        return format(addDays(utcToZonedTime(this.openDate, 'Etc/GMT'), 1), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.openDate) {
        return '00:00:00'
      }

      return null
    },

    startDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    startDateMax () {
      return format(addMonths(new Date(), 3), 'yyyy-MM-dd')
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
      minValue: minValue(0.001)
    },

    openDate: {
      required
    },

    source: {
      required
    },

    form: ['pair', 'price', 'openDate', 'source']
  }
}
</script>

<style>
</style>
