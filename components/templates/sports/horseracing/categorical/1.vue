<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Which horse will win the <b-form-select
          v-model="year"
          class="inline-input"
          :options="computedYears"
          :state="$v.year.$dirty ? !$v.year.$error : null"
        /> <b-form-select
          v-model="event"
          class="inline-input"
          :options="eventOptions"
          :state="$v.event.$dirty ? !$v.event.$error : null"
        />?
      </div>
    </b-card>

    <b-card class="mt-5" title="Outcomes">
      <ol class="outcomes-list">
        <li v-for="(outcome, k) in outcomes" :key="k">
          <div class="d-flex align-items-center">
            <b-form-input v-model="outcome.value" :state="$v.outcomes.$each.$iter[k].$dirty ? !$v.outcomes.$each.$iter[k].$error : null" />

            <div class="ml-3">
              <b-button v-show="k > 1 && outcomes.length > 2" size="sm" variant="danger" title="Remove field" @click.prevent="removeOutcomeField(k)">
                <v-icon name="x" />
              </b-button>
              <b-button v-show="k === outcomes.length-1" size="sm" variant="primary" title="Add new field" @click.prevent="addOutcomeField(k)">
                <v-icon name="plus" />
              </b-button>
            </div>
          </div>
        </li>
      </ol>

      <h6 class="mt-3">
        Required Outcomes
      </h6>
      <b-form-text>Required unchangeable additional outcomes</b-form-text>

      <ol class="outcomes-list">
        <li v-for="(outcome, k) in requiredOutcomes" :key="k">
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
            :min="closeDateMin"
            :max="closeDateMax"
            :state="$v.closeDate.$dirty ? !$v.closeDate.$error : null"
          />
        </b-col>
        <b-col sm="4" md="3" class="mb-3">
          <b-form-timepicker
            v-model="closeTime"
            hide-header
            menu-class="w-100"
            :no-close-button="true"
            :state="$v.closeTime.$dirty ? !$v.closeTime.$error : null"
          />
        </b-col>

        <b-col sm="4" md="3" class="mb-3">
          <b-form-select
            v-model="timezone"
            :options="timezones"
          />
        </b-col>

        <b-col v-if="closeDateTime" cols="12" class="mb-3">
          <b-form-row>
            <b-col cols="12" md="6" lg="4" class="mb-3">
              Converted to UTC-0:
              <p class="mb-0 text-info">
                <DateToUTC :datetime="closeDateTime.toISOString()" />
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
import timezones from '@/assets/data/timezones.json'

function isUniqueOutcome (value) {
  if (value === '') { return true }

  const outcomes = this.outcomes.map(o => o.value)

  return new Set(outcomes).size === outcomes.length
}

export default {
  name: 'SportsHorseRacingCategoricalOne',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      year: null,
      event: null,
      closeDate: null,
      closeTime: null,
      expiryDate: null,
      expiryTime: null,
      outcomes: [{ value: '' }, { value: '' }],
      requiredOutcomes: ['Other', 'No Contest'],
      timezone: 'Etc/GMT',
      eventOptions: [
        { value: null, text: 'Event' },
        'Arkansas Derby',
        'Arlington Million',
        'Belmont',
        'Breeder\'s Cup Classic',
        'Breeder\'s Cup Distaff',
        'Breeder\'s Cup Juvenile',
        'Breeder\'s Cup Mile',
        'Breeder\'s Cup Sprint',
        'Breeder\'s Cup Turf',
        'Dubai World Cup',
        'Haskell Invitational Stakes',
        'Kentucky Derby',
        'Pacific Classic Stakes',
        'Pegasus World Cup',
        'Preakness',
        'Santa Anita Handicap',
        'Travers Stakes',
        'Triple Crown'
      ]
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
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

    closeDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    closeDateMax () {
      return format(addMonths(new Date(), 12), 'yyyy-MM-dd')
    },

    closeDateTime () {
      if (this.closeDate && this.closeTime) {
        return this.convertDateTime(this.closeDate, this.closeTime, this.timezone)
      }

      return null
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
          year: this.year,
          event: this.event,
          closeDate: this.closeDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString(),
          outcomes: [...this.outcomes.filter(o => o.value !== '').map(o => o.value), ...this.requiredOutcomes]
        }

        this.$emit('validated', data, isValid)
      } else {
        this.scrollToTop()
      }

      return isValid
    },

    addOutcomeField () {
      this.outcomes.push({ value: '' })
    },

    removeOutcomeField (index) {
      this.outcomes.splice(index, 1)
    }
  },

  validations: {
    year: {
      required
    },

    event: {
      required
    },

    closeDate: {
      required,
      mustBeEqualOrHigher (value) {
        if (value === '') {
          return true
        }

        return new Date(value).getFullYear() >= this.year
      }
    },

    closeTime: {
      required
    },

    expiryDate: {
      required,
      mustBeEqualOrHigher (value) {
        if (value === '' || !this.expiryDateTime || !this.closeDateTime) {
          return true
        }

        return this.expiryDateTime.getTime() >= this.closeDateTime.getTime()
      }
    },

    expiryTime: {
      required
    },

    outcomes: {
      required,
      minLength: minLength(2),

      $each: {
        value: {
          required,
          minLength: minLength(2),
          isUniqueOutcome,
          validOutcome: (value) => {
            if (value === '') { return true }

            return /^([a-z0-9])[a-z0-9 \- _@]+$/gi.test(value)
          }
        }
      }
    },

    form: ['year', 'event', 'outcomes', 'closeDate', 'closeTime', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
