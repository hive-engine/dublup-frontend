<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        NASCAR
        <b-form-select
          v-model="year"
          class="inline-input"
          :options="computedYears"
          :state="$v.year.$dirty ? !$v.year.$error : null"
        /> <b-form-select
          v-model="event"
          class="inline-input"
          :options="eventOptions"
          :state="$v.event.$dirty ? !$v.event.$error : null"
        />: Winner?
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

    <b-card class="mt-5" title="Resolution information">
      <h5 class="mt-4 mb-3">
        Event Expiration date and time
      </h5>

      <p class="text-muted small">
        This templated market has a predefined event expiration date time, which is 24 hours after estimated schedule start time.
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
  name: 'SportsCarRacingCategoricalOne',

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
      startDate: null,
      startTime: null,
      outcomes: [{ value: '' }, { value: '' }],
      requiredOutcomes: ['Other', 'No Contest'],
      timezone: 'Etc/GMT',
      eventOptions: [
        { value: null, text: 'Event' },
        'Alabama 500',
        'Alsco Uniforms 500',
        'Auto Club 400',
        'Bank of America Roval 400',
        'Bass Pro Shops NRA Night Race',
        'Blue-Emu Max Pain Relief 500',
        'Bluegreen Vacations Duel 1',
        'Bluegreen Vacations Duel 2',
        'Brickyard 400',
        'Busch Clash at Daytona',
        'Coca-Cola 600',
        'Coke Zero Sugar 400',
        'Consumer Energy 400',
        'Daytona 500',
        'Dixie Vodka 400',
        'Drydene 400',
        'FanShield 500',
        'Federated auto Parts 400',
        'First Data 500',
        'Folds of Honor QuickTrip 500',
        'Food City 500',
        'Foxwoods Resort Casino 301',
        'Geico 500',
        'Go Bowling at the Glen',
        'Hollywood Casino 400',
        'Kids Free 325',
        'Nascar All-Star Open',
        'Nascar All-Star Race',
        'Nascar Cup Series Championship Race',
        'O’Reilly Auto Parts 500',
        'Pennzoil 400',
        'Quaker State 400',
        'South Point 400',
        'Southern 500',
        'Texas 500',
        'The Real Heroes 400',
        'Toyota 500',
        'Toyota Owners 400',
        'Worry Free Weather Guarantee 350',
        'Xfinity 500'
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

    expiryDate () {
      if (this.startDate && this.startTime) {
        return format(addHours(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 24), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.startDate && this.startTime) {
        return format(addHours(utcToZonedTime(this.startDateTime.toISOString(), 'Etc/GMT'), 24), 'HH:mm:ss')
      }

      return null
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
          year: this.year,
          event: this.event,
          startDate: this.startDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString(),
          outcomes: [...this.outcomes.filter(o => o.value !== '').map(o => o.value), ...this.requiredOutcomes]
        }

        this.$emit('validated', data, isValid)
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

    startDate: {
      required
    },

    startTime: {
      required
    },

    outcomes: {
      required,
      minLength: minLength(2),

      $each: {
        value: {
          required,
          minLength: minLength(2),
          isUniqueOutcome
        }
      }
    },

    form: ['year', 'event', 'outcomes', 'startDate', 'startTime']
  }
}
</script>

<style>
</style>
