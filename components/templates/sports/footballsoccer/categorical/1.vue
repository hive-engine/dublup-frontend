<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        <b-form-select
          v-model="eventType"
          class="inline-input"
          :options="[{value: null, text:'Event Type'}, 'Men\'s', 'Women\'s']"
          :state="$v.eventType.$dirty ? !$v.eventType.$error : null"
        /> <b-form-select
          v-model="event"
          class="inline-input"
          :options="eventOptions"
          :state="$v.event.$dirty ? !$v.event.$error : null"
        />: Which team will win: <b-form-input
          v-model.number="teamA"
          class="inline-input"
          placeholder="Team A"
          :state="$v.teamA.$dirty ? !$v.teamA.$error : null"
        /> vs. <b-form-input
          v-model.number="teamB"
          class="inline-input"
          placeholder="Team B"
          :state="$v.teamB.$dirty ? !$v.teamB.$error : null"
        />?
      </div>
    </b-card>

    <b-card class="mt-3" title="Estimated start time">
      <b-form-row>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-datepicker
            v-model="startDate"
            hide-header
            :date-format-options="{
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }"
            :min="startDateMin"
            :max="startDateMax"
            :state="$v.startDate.$dirty ? !$v.startDate.$error : null"
          />
        </b-col>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-timepicker
            v-model="startTime"
            hide-header
            menu-class="w-100"
            :no-close-button="true"
            :state="$v.startTime.$dirty ? !$v.startTime.$error : null"
          />
        </b-col>

        <b-col sm="4" md="3" class="mb-3">
          <b-form-select
            v-model="timezone"
            :options="timezones"
          />
        </b-col>

        <b-col v-if="startDateTime" cols="12" class="mb-3">
          <b-form-row>
            <b-col cols="12" md="6" lg="4" class="mb-3">
              Converted to UTC-0:
              <p class="mb-0 text-info">
                <DateToUTC :datetime="startDateTime.toISOString()" />
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
    </b-card>

    <b-card class="mt-3" title="Outcomes">
      <ol class="outcomes-list">
        <li v-for="(outcome, i) of calculatedOutComes" :key="i">
          {{ outcome }}
        </li>
      </ol>
    </b-card>

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        This templated market has a predefined event expiration date, which is 6
        hours after start time in market question.
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
import { addHours, addDays, addMonths } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { required } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import timezones from '@/assets/data/timezones.json'

const isUniqueTeam = (value, vm) => {
  if (value === '') { return true }

  if (!vm.teamA || !vm.teamB) { return true }

  return vm.teamA.toLowerCase() !== vm.teamB.toLowerCase()
}

export default {
  name: 'SportsFootballCategoricalOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      eventType: null,
      event: null,
      teamA: null,
      teamB: null,
      startDate: null,
      startTime: null,
      timezone: 'Etc/GMT',
      eventOptions: [
        { value: null, text: 'Event' },
        'AFC Asian Cup',
        'AFC Champions League',
        'CONCACAF Champions League',
        'CONCACAF Gold Cup',
        'Copa America',
        'Friendlies',
        'UEFA Champions League',
        'UEFA Europa League',
        'World Cup'
      ]
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    expiryDate () {
      if (this.startDate && this.startTime) {
        return format(addHours(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 6), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.startDate && this.startTime) {
        return format(addHours(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 6), 'HH:mm:ss')
      }

      return null
    },

    startDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    startDateMax () {
      return format(addMonths(new Date(), 10), 'yyyy-MM-dd')
    },

    calculatedOutComes () {
      const outcomes = ['Team A', 'Team B', 'Draw', 'No Contest']

      if (this.teamA) { outcomes[0] = this.teamA }
      if (this.teamB) { outcomes[1] = this.teamB }

      return outcomes
    },

    startDateTime () {
      if (this.startDate && this.startTime) {
        return this.convertDateTime(this.startDate, this.startTime, this.timezone)
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
          eventType: this.eventType,
          event: this.event,
          teamA: this.teamA,
          teamB: this.teamB,
          startDate: this.startDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString(),
          outcomes: this.calculatedOutComes
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    eventType: {
      required
    },

    event: {
      required
    },

    teamA: {
      required,
      isUniqueTeam
    },

    teamB: {
      required,
      isUniqueTeam
    },

    startDate: {
      required
    },

    startTime: {
      required
    },

    form: ['eventType', 'event', 'teamA', 'teamB', 'startDate', 'startTime']
  }
}
</script>

<style>
</style>
