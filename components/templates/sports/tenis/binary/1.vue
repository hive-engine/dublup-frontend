<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        <b-form-select
          v-model="teamType"
          class="inline-input"
          :options="computedTeamTypes"
          :state="$v.teamType.$dirty ? !$v.teamType.$error : null"
        /> <b-form-select
          v-model="gameFormat"
          class="inline-input"
          :options="['Singles', 'Doubles']"
          :state="$v.gameFormat.$dirty ? !$v.gameFormat.$error : null"
        /> Tennis: Will <b-form-input
          v-model="players"
          class="inline-input"
          :placeholder=" (gameFormat === 'Singles') ? 'Single Player\'s Name':'Two Players\' Name'"
          :state="$v.players.$dirty ? !$v.players.$error : null"
        /> win the <b-form-select
          v-model="year"
          class="inline-input"
          :options="computedYears"
          :state="$v.year.$dirty ? !$v.year.$error : null"
        /> <b-form-select
          v-model="event"
          class="inline-input"
          :options="calculatedEvents"
          :state="$v.event.$dirty ? !$v.event.$error : null"
        />?
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
            :max="expiryDateMax"
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
import { addDays, addMonths, format } from 'date-fns'
import { required, minLength } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import tenisEvents from '@/assets/data/tenis-events.json'
import timezones from '@/assets/data/timezones.json'

export default {
  name: 'SportsTenisBinaryOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      teamType: null,
      gameFormat: 'Singles',
      players: '',
      year: null,
      event: null,
      expiryDate: null,
      expiryTime: null,
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    computedTeamTypes () {
      const teamTypes = [{ value: null, text: 'Team Types' }, 'Men\'s', 'Women\'s']

      if (this.gameFormat === 'Doubles') {
        return [...teamTypes, 'Mixed']
      }

      return teamTypes
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

    calculatedEvents () {
      const events = [{ value: null, text: 'Event' }]

      if (this.teamType) {
        return [...events, ...tenisEvents[this.teamType]]
      }

      return events
    },

    expiryDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateMax () {
      return format(addMonths(new Date(), 3), 'yyyy-MM-dd')
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate, this.expiryTime, this.timezone)
      }

      return null
    }
  },

  watch: {
    teamType () {
      this.event = null
    },

    gameFormat () {
      this.teamType = null
      this.event = null
    }
  },

  methods: {
    validate () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      if (isValid) {
        const data = {
          teamType: this.teamType,
          gameFormat: this.gameFormat,
          players: this.players,
          year: this.year,
          event: this.event,
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    teamType: {
      required
    },

    gameFormat: {
      required
    },

    players: {
      required,
      minLength: minLength(3)
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

    form: ['teamType', 'gameFormat', 'players', 'year', 'event', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
