<template>
  <div>
    <b-card title="Market question">
      <div class="market-question">
        <b-form-select
          v-model="socialmedia"
          class="inline-input"
          :options="socialmediaOptions"
          :state="$v.socialmedia.$dirty ? !$v.socialmedia.$error : null"
        />: Will <b-form-input
          v-model.number="username"
          class="inline-input"
          placeholder="Username"
          :state="$v.username.$dirty ? !$v.username.$error : null"
        /> have <b-form-input
          v-model.number="followers"
          class="inline-input"
          type="number"
          placeholder="Number of Followers"
          step="any"
          :state="$v.followers.$dirty ? !$v.followers.$error : null"
        /> or more followers on <b-form-datepicker
          v-model="date"
          hide-header
          class="inline-input"
          :date-format-options="{
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }"
          :min="startDateMin"
          :max="startDateMax"
          :state="$v.date.$dirty ? !$v.date.$error : null"
        />, according to www.socialblade.com?
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
        This templated market has a predefined event expiration date, which is 2
        days after start date in market question.
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
            :hour12="true"
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
import { addDays, addMonths } from 'date-fns'
import { format, utcToZonedTime } from 'date-fns-tz'
import { required, numeric } from 'vuelidate/lib/validators'
import ResolutionRules from '@/components/ResolutionRules.vue'

export default {
  name: 'EntertainmentSocialMediaBinaryQuestionOne',

  components: {
    ResolutionRules
  },

  props: {
    template: { type: String, required: true }
  },

  data () {
    return {
      socialmedia: null,
      username: '',
      followers: '',
      date: null,

      socialmediaOptions: [{ value: null, text: 'Social Media' }, 'Twitter', 'Instagram']
    }
  },

  computed: {
    expiryDate () {
      if (this.date) {
        return format(addDays(utcToZonedTime(this.convertDateTime(this.date), 'Etc/GMT'), 2), 'yyyy-MM-dd')
      }

      return null
    },

    expiryTime () {
      if (this.date) {
        return '00:00:00'
      }

      return null
    },

    startDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    startDateMax () {
      return format(addMonths(new Date(), 12), 'yyyy-MM-dd')
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

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime) {
        return this.convertDateTime(this.expiryDate)
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
          socialmedia: this.socialmedia,
          username: this.username,
          followers: this.followers,
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
    socialmedia: {
      required
    },

    username: {
      required
    },

    followers: {
      required,
      numeric
    },

    date: {
      required
    },

    form: ['socialmedia', 'username', 'followers', 'date']
  }
}
</script>

<style>
</style>
