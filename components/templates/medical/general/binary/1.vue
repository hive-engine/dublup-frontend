<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Will there be <b-form-input
          v-model.number="amount"
          step="1"
          type="number"
          class="inline-input"
          placeholder="Whole #"
          :state="$v.amount.$dirty ? !$v.amount.$error : null"
        /> or more total confirmed <b-form-select
          v-model="amountType"
          class="inline-input"
          :options="[{ value: null, text: 'Case/Death' }, 'Cases of', 'Deaths from']"
          :state="$v.amountType.$dirty ? !$v.amountType.$error : null"
        /> Coronavirus (Covid-19) in  <b-form-select
          v-model="country"
          class="inline-input"
          :options="[{ value: null, text: 'Countires' }, 'The World', ...countries]"
          :state="$v.country.$dirty ? !$v.country.$error : null"
        /> by <b-form-datepicker
          v-model="date"
          hide-header
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :state="$v.date.$dirty ? !$v.date.$error : null"
        /> according to https://www.worldometers.info/coronavirus/?
      </div>
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        This templated market has a predefined event expiration date, which is 2 days after the date in the market question.
      </p>

      <b-form-row>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-datepicker
            v-model="expiryDate"
            hide-header
            :date-format-options="{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }"
            :disabled="true"
          />
        </b-col>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-timepicker
            v-model="expiryTime"
            hide-header
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
import { addDays } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { required, numeric } from 'vuelidate/lib/validators'
import ResolutionRules from '@/components/ResolutionRules.vue'
import countries from '@/assets/data/countries.json'

export default {
  name: 'MedicalGeneralBinaryOne',

  components: {
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      amount: '',
      amountType: null,
      country: null,
      date: null,
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    countries () {
      return countries
    },

    expiryDate () {
      if (this.date) {
        return format(addDays(utcToZonedTime(this.date), 2), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.date) {
        return '00:00:00'
      }

      return null
    },

    expiryDateTime () {
      if (this.expiryDate) {
        return this.convertDateTime(this.expiryDate)
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
          amount: this.amount,
          amountType: this.amountType,
          country: this.country,
          date: this.convertDateTime(this.date).toISOString(),
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    amount: {
      required,
      numeric
    },

    amountType: {
      required
    },

    country: {
      required
    },

    date: {
      required
    },

    form: ['amount', 'amountType', 'country', 'date']
  }
}
</script>

<style>
</style>
