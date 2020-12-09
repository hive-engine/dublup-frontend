<template>
  <form-wizard ref="creationWizard" step-size="xs" @on-complete="createMarket" @on-change="tabOnChange">
    <div slot="title" />

    <wizard-step
      slot="step"
      slot-scope="props"
      :tab="props.tab"
      :transition="props.transition"
      :index="props.index"
    />

    <tab-content title="Market Type" icon="" :lazy="true">
      <b-card>
        <b-row>
          <b-col cols="12" sm="6" md="4" lg="3">
            <radio-button
              id="binary"
              v-model="marketType"
              type="radio"
              name="marketType"
              button-value="binary"
              icon="terminal"
              label="Yes/No"
              description="There are two possible outcomes: Yes or No"
            />
          </b-col>

          <b-col cols="12" sm="6" md="4" lg="3">
            <radio-button
              id="categorical"
              v-model="marketType"
              type="radio"
              name="marketType"
              button-value="categorical"
              icon="list"
              label="Multiple Choice"
              description="There are multiple possible outcomes"
            />
          </b-col>
        </b-row>
      </b-card>
    </tab-content>

    <tab-content title="Event Details" icon="" :lazy="true" :before-change="() => validateForm(question)">
      <b-card title="Market Question" title-tag="h5">
        <b-form-group>
          <b-form-text>
            <ul class="list-unstyled">
              <li>
                If entering a date and time in the Market Question, enter a date
                and time in the UTC-0 timezone.
              </li>
              <li>
                If the winning outcome will be determined using a specific
                source, you must enter the source URL or its full name in the
                Market Question.
              </li>
            </ul>
          </b-form-text>
          <b-form-textarea
            v-model="question"
            :placeholder="(marketType === 'binary') ? 'Example: Will the [Person] win the [Year] [Event]?' : 'Example: How many [goals/points] will [person] score in the [year] [event]?'"
            :state="$v.question.$dirty ? !$v.question.$error : null"
          />
        </b-form-group>
      </b-card>

      <b-card v-if="marketType === 'categorical'" class="mt-3" title="Outcomes" title-tag="h5">
        <b-form-text>List the outcomes people can choose from.</b-form-text>

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
      </b-card>

      <b-card class="mt-3" title="Market category" title-tag="h5">
        <b-form-row>
          <b-col sm="4" md="3" class="mb-3">
            <b-form-select
              v-model="category"
              :options="categories"
              :state="$v.category.$dirty ? !$v.category.$error : null"
            />
          </b-col>
          <b-col sm="4" md="3" class="mb-3">
            <b-form-select
              v-model="subCategory"
              :options="subCategories"
              :state="$v.subCategory.$dirty ? !$v.subCategory.$error : null"
            />
          </b-col>
        </b-form-row>
      </b-card>

      <b-card class="mt-3" title="Event expiration date and time" title-tag="h5">
        <p class="text-muted small">
          Choose a date and time that is sufficiently after the end of the
          event. If event expiration before the event end time the market will
          likely be reported as invalid. Make sure to factor in potential delays
          that can impact the event end time.
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
      </b-card>

      <b-card class="mt-3" title="Resolution information" title-tag="h5">
        <b-form-group
          label="Resolution details"
          description="Describe what users need to know to determine the outcome of the event."
        >
          <b-form-text>
            <ul class="list-unstyled">
              <li>
                If entering a date and time in Resolution Details, enter a date
                and time in the UTC-0 timezone.
              </li>
              <li>
                If using a resolution source in the Resolution Details it must
                match and not contradict what is used in the Market Question.
              </li>
              <li>
                A backup resolution source can be listed in the Resolution
                Details in addition to the primary resolution source, as long as
                the primary resolution source is used in the Market Question.
              </li>
            </ul>
          </b-form-text>
          <b-form-textarea
            v-model="rulesA"
            placeholder="Describe how the event should be resolved under different scenarios."
            :state="$v.rulesA.$dirty ? !$v.rulesA.$error : null"
          />
        </b-form-group>

        <b-form-group
          label="Resolution details"
          description="Describe what users need to know to determine the outcome of the event."
        >
          <b-form-text>
            <ul class="list-unstyled">
              <li>If entering a date and time in Resolution Details, enter a date and time in the UTC-0 timezone.</li>
              <li>Do not enter a resolution source in Resolution Details, it must be entered in the Market Question.</li>
            </ul>
          </b-form-text>
          <b-form-textarea
            v-model="rulesB"
            placeholder="Describe how the event should be resolved under different scenarios."
          />
        </b-form-group>
      </b-card>
    </tab-content>

    <tab-content title="Preview" icon="" :lazy="true">
      <market-preview />
    </tab-content>

    <template slot="footer" slot-scope="props">
      <div class="wizard-footer-left">
        <wizard-button
          v-if="props.activeTabIndex > 0"
          :style="props.fillButtonStyle"
          @click.native="props.prevTab()"
        >
          Back
        </wizard-button>
      </div>
      <div class="wizard-footer-right">
        <wizard-button
          v-if="!props.isLastStep && props.activeTabIndex > 0"
          class="wizard-footer-right"
          :style="props.fillButtonStyle"
          :disabled="disableNext(props.activeTabIndex)"
          @click.native="props.nextTab()"
        >
          Next
        </wizard-button>

        <wizard-button
          v-if="props.isLastStep"
          class="wizard-footer-right finish-button"
          :style="props.fillButtonStyle"
          :disabled="balance.balance < settings.creation_fee"
          @click.native="props.nextTab()"
        >
          Create
        </wizard-button>
      </div>
    </template></div>
  </form-wizard>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { FormWizard, TabContent, WizardButton, WizardStep } from 'vue-form-wizard'
import { addDays } from 'date-fns'
import { format } from 'date-fns-tz'
import { required, requiredIf, minLength } from 'vuelidate/lib/validators'
import DateToUTC from '@/components/DateToUTC.vue'
import RadioButton from '@/components/elements/RadioButton.vue'
import MarketPreview from '@/components/MarketPreview.vue'
import jsonCategories from '@/assets/data/categories.json'
import timezones from '@/assets/data/timezones.json'

export default {
  name: 'CustomCreate',

  components: {
    DateToUTC,
    FormWizard,
    MarketPreview,
    RadioButton,
    TabContent,
    WizardButton,
    WizardStep
  },

  middleware: 'authenticated',

  data () {
    return {
      dataLoaded: null,
      marketType: '',
      question: '',
      category: null,
      subCategory: null,
      expiryDate: null,
      expiryTime: null,
      timezone: 'Etc/GMT',
      rulesA: '',
      rulesB: '',
      outcomes: [{ value: '' }, { value: '' }]
    }
  },

  async fetch () {
    this.dataLoaded = false

    await this.fetchUserTokenBalance()

    this.dataLoaded = true
  },

  head () {
    return {
      title: 'Create Custom Market'
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username', 'balance']),
    ...mapGetters('market', { questionData: 'question' }),

    timezones () {
      return timezones.map(tz => ({ value: tz.tzCode, text: tz.label }))
    },

    categories () {
      return [{ value: null, text: 'Category' }, ...Object.keys(jsonCategories)]
    },

    subCategories () {
      const subCategories = [{ value: null, text: 'Sub Category' }]

      if (this.category) {
        return [...subCategories, ...Object.keys(jsonCategories[this.category].sub_category)]
      }

      return subCategories
    },

    expiryDateMin () {
      return format(addDays(new Date(), 1), 'yyyy-MM-dd')
    },

    expiryDateTime () {
      if (this.expiryDate && this.expiryTime && this.timezone) {
        return this.convertDateTime(this.expiryDate, this.expiryTime, this.timezone)
      }

      return null
    }
  },

  watch: {
    marketType (value) {
      if (value !== '') {
        this.$refs.creationWizard.nextTab()
      }
    },

    dataLoaded: {
      deep: true,
      handler (value) {
        if (value === false || value === null) {
          this.showLoadingOverlay()
        } else {
          this.hideLoadingOverlay()
        }
      }
    }
  },

  mounted () {
    const self = this

    this.$eventBus.$on(['create-market-successful'], async () => {
      self.dataLoaded = false

      await self.sleep(20 * 1000)

      self.dataLoaded = true

      await self.sleep(1 * 1000)

      self.$router.push({ name: 'user-markets', params: { user: self.username } })
    })
  },

  methods: {
    format,

    ...mapMutations('market', ['SET_QUESTION_DATA']),
    ...mapActions('market', ['requestCreateMarket']),
    ...mapActions('user', ['fetchUserTokenBalance']),

    createMarket () {
      return this.requestCreateMarket()
    },

    disableNext (index) {
      if (index === 0 && (!this.marketType || this.marketType === '')) {
        return true
      }

      return false
    },

    validateForm () {
      this.$v.form.$touch()
      const isValid = !this.$v.form.$invalid

      const data = {
        question: this.question,
        rules: [this.rulesA, this.rulesB].filter(r => r !== ''),
        expiryDate: this.expiryDateTime ? this.expiryDateTime.toISOString() : this.expiryDateTime
      }

      if (this.marketType === 'categorical') {
        data.outcomes = this.outcomes.filter(o => o.value !== '').map(o => o.value)
      }

      if (isValid) {
        this.SET_QUESTION_DATA({ category: this.category, sub_category: this.subCategory, type: this.marketType, template: 'custom', ...data })
      }

      return isValid
    },

    addOutcomeField () {
      this.outcomes.push({ value: '' })
    },

    removeOutcomeField (index) {
      this.outcomes.splice(index, 1)
    },

    tabOnChange (prev, next) {
      if (prev === 1 && next === 0) {
        this.marketType = ''

        this.$v.$reset()
      }
    }
  },

  validations: {
    marketType: {
      required
    },

    question: {
      required
    },

    category: {
      required
    },

    subCategory: {
      required
    },

    expiryDate: {
      required
    },

    expiryTime: {
      required
    },

    rulesA: {
      required
    },

    outcomes: {
      required: requiredIf(function () {
        return this.marketType === 'categorical'
      }),
      minLength: minLength(2),

      $each: {
        value: {
          required: requiredIf(function () {
            return this.marketType === 'categorical'
          }),
          minLength: minLength(2)
        }
      }
    },

    form: ['question', 'category', 'subCategory', 'expiryDate', 'expiryTime', 'rulesA', 'outcomes']
  }
}
</script>

<style>
</style>
