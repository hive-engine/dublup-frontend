<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        <b-form-select
          v-model="tournament"
          class="inline-input"
          :options="tournamentOptions"
          :state="$v.tournament.$dirty ? !$v.tournament.$error : null"
        />
        <b-form-select
          v-if="tournament === 'NCAA'"
          v-model="ncaa"
          class="inline-input"
          :options="ncaaOptions"
          :state="$v.ncaa.$dirty ? !$v.ncaa.$error : null"
        />: Will the
        <b-form-select
          v-model="teamA"
          class="inline-input"
          :options="[{ value: null, text: 'Team A' }, ...computedTeams]"
          :state="$v.teamA.$dirty ? !$v.teamA.$error : null"
        />
        win vs. the
        <b-form-select
          v-model="teamB"
          class="inline-input"
          :options="[{ value: null, text: 'Team B' }, ...computedTeams]"
          :state="$v.teamB.$dirty ? !$v.teamB.$error : null"
        />?
      </div>
    </b-card>

    <b-card class="mt-5" title="Estimated start time">
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
import { required, requiredIf } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import basketballTeams from '@/assets/data/teams/basketball-teams.json'
import timezones from '@/assets/data/timezones.json'

const isUniqueTeam = (value, vm) => {
  if (value === '') { return true }

  if (!vm.teamA || !vm.teamB) { return true }

  return vm.teamA.toLowerCase() !== vm.teamB.toLowerCase()
}

export default {
  name: 'SportsBasketballBinaryOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      tournament: null,
      tournamentOptions: [
        { value: null, text: 'NBA/WNBA/NCAA' }, 'NBA', 'WNBA', 'NCAA'
      ],
      ncaa: 'Men\'s BB',
      ncaaOptions: ['Men\'s BB', 'Women\'s BB'],
      teamA: null,
      teamB: null,
      startDate: null,
      startTime: null,
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    computedTeams () {
      let computedTeams = []

      if (this.tournament) {
        computedTeams = basketballTeams[this.tournament]
      }

      return computedTeams
    },

    startDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    startDateMax () {
      return format(addMonths(new Date(), 12), 'yyyy-MM-dd')
    },

    startDateTime () {
      if (this.startDate && this.startTime) {
        return this.convertDateTime(this.startDate, this.startTime, this.timezone)
      }

      return null
    },

    closeDate () {
      if (this.startDate && this.startTime) {
        return format(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 'yyyy-MM-dd')
      }

      return null
    },

    closeTime () {
      if (this.startDate && this.startTime) {
        return format(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 'HH:mm:ss')
      }

      return null
    },

    closeDateTime () {
      if (this.closeDate && this.closeTime) {
        return this.startDateTime
      }

      return null
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

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate, this.expiryTime)
      }

      return null
    }
  },

  watch: {
    tournament () {
      this.teamA = null
      this.teamB = null
    }
  },

  methods: {
    validate () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      if (isValid) {
        const data = {
          tournament: this.tournament === 'NCAA' ? `${this.tournament} ${this.ncaa}` : this.tournament,
          teamA: this.teamA,
          teamB: this.teamB,
          startDate: this.startDateTime.toISOString(),
          closeDate: this.closeDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    tournament: {
      required
    },

    ncaa: {
      required: requiredIf(function () {
        return this.tournament === 'NCAA'
      })
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

    form: ['tournament', 'ncaa', 'teamA', 'teamB', 'startDate', 'startTime']
  }
}
</script>

<style>
</style>
