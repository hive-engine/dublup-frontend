<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Olympics <b-form-select
          v-model="sport"
          class="inline-input"
          :options="calculatedSports"
          :state="$v.sport.$dirty ? !$v.sport.$error : null"
        />: Will <b-form-select
          v-model="country"
          class="inline-input"
          :options="countryOptions"
          :state="$v.country.$dirty ? !$v.country.$error : null"
        /> win a gold medal in <b-form-select
          v-model="event"
          class="inline-input"
          :options="calculatedEvents"
          :state="$v.event.$dirty ? !$v.event.$error : null"
        /> at the <b-form-select
          v-model="year"
          class="inline-input"
          :options="computedYears"
          :state="$v.year.$dirty ? !$v.year.$error : null"
        /> <b-form-select
          v-model="season"
          class="inline-input"
          :options="['Summer', 'Winter']"
          :state="$v.season.$dirty ? !$v.season.$error : null"
        /> Olympics?
      </div>
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        Choose a date and time that is sufficiently after the end of the event.
        If event expiration before the event end time the market will likely be
        reported as invalid. Make sure to factor in potential delays that can
        impact the event end time.
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
import { addDays, format } from 'date-fns'
import { required } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import olympics from '@/assets/data/olympics.json'
import countries from '@/assets/data/countries.json'
import timezones from '@/assets/data/timezones.json'

export default {
  name: 'SportsOlympicsBinaryOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      season: 'Summer',
      sport: null,
      year: null,
      event: null,
      country: null,
      expiryDate: null,
      expiryTime: null,
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    countryOptions () {
      return [{ value: null, text: 'Country' }, ...countries]
    },

    computedYears () {
      const years = (this.season === 'Summer') ? [2021, 2024, 2028] : [2022, 2026, 2030]

      return [
        { value: null, text: 'Year' }, ...years]
    },

    calculatedSports () {
      return [
        { value: null, text: 'Sports' },
        ...Object.keys(olympics[this.season])
      ]
    },

    calculatedEvents () {
      const events = [{ value: null, text: 'Event' }]

      if (this.sport) {
        return [
          ...events,
          ...olympics[this.season][this.sport]
        ]
      }

      return events
    },

    expiryDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate, this.expiryTime, this.timezone)
      }

      return null
    }
  },

  watch: {
    season () {
      this.sport = null
      this.event = null
    }
  },

  methods: {
    validate () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      if (isValid) {
        const data = {
          sport: this.sport,
          season: this.season,
          year: this.year,
          event: this.event,
          country: this.country,
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    sport: {
      required
    },

    country: {
      required
    },

    season: {
      required
    },

    year: {
      required
    },

    event: {
      required
    },

    expiryDate: {
      required,
      mustBeEqualOrHigher (value) {
        if (value === '') {
          return true
        }

        return new Date(value).getFullYear() >= this.year
      }
    },

    expiryTime: {
      required
    },

    form: ['sport', 'country', 'season', 'year', 'event', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
