<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        Will <b-form-input
          v-model="candidate"
          class="inline-input"
          placeholder="Single Candidates Name"
          :state="$v.candidate.$dirty ? !$v.candidate.$error : null"
        /> run for <b-form-select
          v-model="office"
          class="inline-input"
          :options="officeOptions"
          :state="$v.office.$dirty ? !$v.office.$error : null"
        /> by <b-form-datepicker
          v-model="date"
          hide-header
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :state="$v.date.$dirty ? !$v.date.$error : null"
        />?
      </div>
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
import { format, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { required } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import timezones from '@/assets/data/timezones.json'

export default {
  name: 'PoliticsUSBinaryTwo',

  components: {
    DateToUTC,
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      candidate: '',
      office: null,
      date: null,
      expiryDate: null,
      expiryTime: null,
      timezone: 'Etc/GMT',
      officeOptions: [
        { value: null, text: 'Office' },
        'U.S House of Representatives',
        'U.S. President',
        'U.S. Senator',
        'U.S. Vice-President'
      ]
    }
  },

  computed: {
    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    closeDate () {
      if (this.date) {
        return format(utcToZonedTime(this.convertDateTime(this.date), 'Etc/GMT'), 'yyyy-MM-dd')
      }

      return null
    },

    closeTime () {
      if (this.date) {
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

    expiryDateMin () {
      return format(addDays(this.date ? new Date(this.date) : new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateMax () {
      return format(addMonths(this.date ? new Date(this.date) : new Date(), 12), 'yyyy-MM-dd')
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
          candidate: this.candidate,
          office: this.office,
          date: this.convertDateTime(this.date).toISOString(),
          closeDate: this.closeDateTime.toISOString(),
          expiryDate: this.expiryDateTime.toISOString()
        }

        this.$emit('validated', data, isValid)
      }

      return isValid
    }
  },

  validations: {
    candidate: {
      required
    },

    office: {
      required
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

    form: ['candidate', 'date', 'office', 'expiryDate', 'expiryTime']
  }
}
</script>

<style>
</style>
