<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        NFL: Will the
        <b-form-select
          v-model="team"
          class="inline-input"
          :options="[{ value: null, text: 'Team' }, ...nftTeams]"
          :state="$v.team.$dirty ? !$v.team.$error : null"
        />
        win SuperBowl
        <b-form-select
          v-model="numeral"
          class="inline-input"
          :options="numeralOptions"
          :state="$v.numeral.$dirty ? !$v.numeral.$error : null"
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
import { addDays, addMonths } from 'date-fns'
import { format } from 'date-fns-tz'
import { required } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import nftTeams from '@/assets/data/teams/nft-teams.json'
import timezones from '@/assets/data/timezones.json'

const isUniqueTeam = (value, vm) => {
  if (value === '') { return true }

  if (!vm.teamA || !vm.teamB) { return true }

  return vm.teamA.toLowerCase() !== vm.teamB.toLowerCase()
}

export default {
  name: 'SportsAmericanFootballBinaryFive',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      team: null,
      numeral: null,
      expiryDate: null,
      expiryTime: null,
      numeralOptions: [
        { value: null, text: 'Numeral' },
        'LV (55TH)',
        'LVI (56TH)',
        'LVII (57TH)'
      ],
      timezone: 'Etc/GMT'
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    nftTeams () {
      return nftTeams
    },

    expiryDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateMax () {
      return format(addMonths(new Date(), 12), 'yyyy-MM-dd')
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate, this.expiryTime, this.timezone)
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
          team: this.team,
          numeral: this.numeral,
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    team: {
      required,
      isUniqueTeam
    },

    numeral: {
      required
    },

    expiryDate: {
      required
    },

    expiryTime: {
      required
    },

    form: ['team', 'numeral', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
