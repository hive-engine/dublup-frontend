<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Will the seasonally adjusted national Unemployment Rate for
        <b-form-select
          v-model="month"
          class="inline-input"
          :options="monthOptions"
          :state="$v.month.$dirty ? !$v.month.$error : null"
        />
        <b-form-select
          v-model="year"
          class="inline-input"
          :options="computedYears"
          :state="$v.year.$dirty ? !$v.year.$error : null"
        /> be
        <b-form-input
          v-model.number="percentage"
          class="inline-input"
          placeholder="Pecentage"
          type="number"
          :state="$v.percentage.$dirty ? !$v.percentage.$error : null"
        />% or higher according to the US Bureau Labor of Statistics?
      </div>
    </b-card>

    <b-card class="mt-5" title="Outcomes">
      <ol class="outcomes-list">
        <li v-for="(outcome, i) of calculatedOutComes" :key="i">
          {{ outcome }}
        </li>
      </ol>
    </b-card>

    <b-card class="mt-5" title="Market close time">
      <p class="text-muted small">
        After the market close time no new shares can be issued but existing shares can be traded on the secondary market.
      </p>
      <b-form-row>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-datepicker
            v-model="closeDate"
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
            v-model="closeTime"
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
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        This templated market has a predefined event expiration date, which is one
        month after the date in the market question.
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
import { addMonths, lastDayOfMonth } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { required, numeric } from 'vuelidate/lib/validators'
import ResolutionRules from '@/components/ResolutionRules.vue'

export default {
  name: 'EconomicsStatisticsCategoricalOne',

  components: {
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      month: null,
      year: null,
      percentage: ''
    }
  },

  computed: {
    monthOptions () {
      return [{ value: null, text: 'Month' }, 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },

    calculatedOutComes () {
      let outcomes = ['[Number]% or Higher', 'Below [Number]%']

      if (this.percentage) {
        outcomes = outcomes.map(o => o.replace('[Number]', this.percentage))
      }

      return outcomes
    },

    computedYears () {
      const currentYear = new Date().getFullYear()

      return [
        { value: null, text: 'Year' },
        currentYear,
        currentYear + 1,
        currentYear + 2
      ]
    },

    closeDate () {
      if (this.month && this.year) {
        return format(
          utcToZonedTime(
            this.convertDateTime(
              format(lastDayOfMonth(new Date(`${this.month} 1, ${this.year}`)), 'yyyy-MM-dd')
            ), 'Etc/GMT'), 'yyyy-MM-dd')
      }

      return null
    },

    closeTime () {
      if (this.month && this.year) {
        return '00:00:00'
      }

      return null
    },

    closeDateTime () {
      if (this.closeDate && this.closeTime) {
        return this.convertDateTime(this.closeDate, this.closeTime)
      }

      return null
    },

    expiryDate () {
      if (this.month && this.year) {
        return format(
          addMonths(
            utcToZonedTime(
              this.convertDateTime(
                format(lastDayOfMonth(new Date(`${this.month} 1, ${this.year}`)), 'yyyy-MM-dd')
              ), 'Etc/GMT'), 1), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.month && this.year) {
        return '00:00:00'
      }

      return null
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
          month: this.month,
          year: this.year,
          percentage: this.percentage,
          closeDate: this.closeDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString(),
          outcomes: this.calculatedOutComes
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    month: {
      required
    },

    year: {
      required,
      mustBeHigher (value) {
        if (value === '') {
          return true
        }

        return addMonths(lastDayOfMonth(new Date(`${this.month} 1, ${this.year}`)), 1).getTime() > Date.now()
      }
    },

    percentage: {
      required,
      numeric
    },

    form: ['month', 'year', 'percentage']
  }
}
</script>

<style>
</style>
