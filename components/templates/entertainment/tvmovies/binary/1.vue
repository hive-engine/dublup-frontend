<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Will the total gross for <b-form-input
          v-model.number="movie"
          class="inline-input"
          placeholder="Individual Movie Title"
          :state="$v.movie.$dirty ? !$v.movie.$error : null"
        /> be $<b-form-input
          v-model.number="sales"
          class="inline-input"
          type="number"
          placeholder="Total Gross Sales"
          step="any"
          :state="$v.sales.$dirty ? !$v.sales.$error : null"
        /> USD or more on domestic opening weekend of <b-form-datepicker
          v-model="date"
          hide-header
          class="inline-input"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :min="startDateMin"
          :state="$v.date.$dirty ? !$v.date.$error : null"
        /> in the US, according to www.boxofficemojo.com?
      </div>
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        Choose a date and time that is sufficiently after the end of the event. If event expiration before the event end time the market will likely be reported as invalid. Make sure to factor in potential delays that can impact the event end time
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
            :min="expiryDateMin"
            :state="$v.expiryDate.$dirty ? !$v.expiryDate.$error : null"
          />
        </b-col>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-timepicker
            v-model="expiryTime"
            hide-header
            :hour12="true"
            menu-class="w-100"
            :no-close-button="true"
            :state="$v.expiryTime.$dirty ? !$v.expiryTime.$error : null"
          />
        </b-col>

        <b-col sm="4" md="3" class="mb-3">
          <b-form-select
            v-model="timezone"
            :options="timezones"
          />
        </b-col>

        <b-col v-if="expiryDateTime" cols="12" class="mb-3">
          <b-form-row>
            <b-col cols="12" md="6" lg="4" class="mb-3">
              Converted to UTC-0:
              <p class="mb-0 text-info">
                <DateToUTC :datetime="expiryDateTime.toISOString()" />
              </p>
            </b-col>

            <b-col cols="12" md="6" lg="8" class="mb-3 text-muted">
              We will be using the UTC-0 timezone to standardize times. Ensure the
              UTC-0 time is accurate and does not conflict with the resolution start
              time.
            </b-col>
          </b-form-row>
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
import { format, zonedTimeToUtc } from 'date-fns-tz'
import { required, numeric } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import timezones from '@/assets/data/timezones.json'

export default {
  name: 'EntertainmentTVMoviesBinaryQuestionOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      movie: '',
      sales: '',
      date: null,
      expiryDate: null,
      expiryTime: null,
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    startDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateMin () {
      if (this.date) {
        return format(addDays(new Date(this.date), 1), 'yyyy-MM-dd')
      }

      return null
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime && this.timezone) {
        return this.convertDateTime(this.expiryDate, this.expiryTime, this.timezone)
      }

      return null
    }
  },

  methods: {
    format,

    validate () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      if (isValid) {
        const data = {
          movie: this.movie,
          sales: this.sales,
          date: this.convertDateTime(this.date).toISOString(),
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    movie: {
      required
    },

    sales: {
      required,
      numeric
    },

    date: {
      required
    },

    expiryDate: {
      required,
      mustBeEqualOrHigher (value) {
        if (value === '' || !this.date || !this.expiryDateTime) {
          return true
        }

        return this.expiryDateTime.getTime() >= zonedTimeToUtc(this.date, 'Etc/GMT').getTime()
      }
    },

    expiryTime: {
      required
    },

    form: ['movie', 'sales', 'date', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
