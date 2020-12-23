<template>
  <form-wizard
    ref="creationWizard"
    step-size="xs"
    @on-complete="createMarket"
    @on-change="tabOnChange"
  >
    <div slot="title" />

    <wizard-step
      slot="step"
      slot-scope="props"
      :tab="props.tab"
      :transition="props.transition"
      :index="props.index"
    />

    <tab-content title="Category" icon="" :lazy="true">
      <b-card title="Use a market template">
        <b-form-text>Templates simplify the creation of new markets and reduce errors in the market making process.</b-form-text>

        <b-row class="mt-3">
          <b-col
            v-for="(c, ci) of categories"
            :key="ci"
            class="text-sm-center text-md-left mt-3 mb-3"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <radio-button
              :id="c"
              :key="ci"
              v-model="category"
              type="radio"
              name="category"
              :button-value="c"
              :icon="getCategoyIcon(c)"
              :label="c"
            />
          </b-col>
        </b-row>
      </b-card>

      <b-card class="mt-5" title="Start from scratch">
        <b-form-text>Create a completely custom market, only recommended for advanced users.</b-form-text>

        <b-button class="mt-3" variant="outline-danger" :to="{name:'create-custom'}">
          Create a custom market
        </b-button>
      </b-card>
    </tab-content>

    <tab-content title="Subcategory" icon="" :lazy="true">
      <b-card>
        <b-row>
          <b-col
            v-for="(c, ci) of subCategories"
            :key="ci"
            class="text-sm-center text-md-left mt-3 mb-3"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <radio-button
              :id="c"
              :key="ci"
              v-model="subCategory"
              type="radio"
              name="subcategory"
              :button-value="c"
              :icon="getSubCategoyIcon(c)"
              :label="c"
            />
          </b-col>
        </b-row>
      </b-card>
    </tab-content>

    <tab-content title="Market Type" icon="" :lazy="true">
      <b-card>
        <b-row>
          <b-col
            v-for="(t, ti) of marketTypeData"
            :key="ti"
            class="text-sm-center text-md-left mt-3 mb-3"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <radio-button
              v-if="t === 'binary'"
              id="binary"
              v-model="marketType"
              type="radio"
              name="marketType"
              button-value="binary"
              icon="terminal"
              label="Yes/No"
              description="There are two possible outcomes: Yes or No"
            />

            <radio-button
              v-if="t === 'categorical'"
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

    <tab-content title="Template" icon="" :lazy="true">
      <b-card>
        <ul v-if="questionsData.length > 0" class="list-unstyled mb-0">
          <li v-for="(q, i) of questionsData" :key="i" :class="{ 'mb-3': i < questionsData.length - 1}">
            <radio-question
              :id="q.id"
              v-model="question"
              name="question"
              :button-value="q.id"
              :question="q.question"
              :example="q.example"
            />
          </li>
        </ul>

        <div v-else class="text-center mt-5 mb-5 h6">
          <p> No templates are found for this market type!</p>
          <p>
            Please consider creating a <nuxt-link :to="{name:'create-custom'}">
              custom market
            </nuxt-link>.
          </p>
        </div>
      </b-card>
    </tab-content>

    <tab-content
      title="Event Details"
      icon=""
      :lazy="true"
      :before-change="() => validateForm(question)"
    >
      <component
        :is="questionComponent"
        :ref="question"
        :template="question"
        @validated="formValidated"
      />
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
    </template>
  </form-wizard>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { FormWizard, TabContent, WizardButton, WizardStep } from 'vue-form-wizard'
import { format } from 'date-fns'
import RadioButton from '@/components/elements/RadioButton.vue'
import RadioQuestion from '@/components/elements/RadioQuestion.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import MarketPreview from '@/components/MarketPreview.vue'
import jsonCategories from '@/assets/data/categories.json'
import jsonQuestions from '@/assets/data/questions.json'

export default {
  name: 'CreateMarket',

  components: {
    FormWizard,
    MarketPreview,
    RadioButton,
    RadioQuestion,
    ResolutionRules,
    TabContent,
    WizardButton,
    WizardStep
  },

  middleware: 'authenticated',

  data () {
    return {
      dataLoaded: null,
      category: '',
      subCategory: '',
      marketType: '',
      question: 'trading-crypto-binary-1',
      categoryData: {},
      subCategoryData: {},
      marketTypeData: [],
      questionsData: []
    }
  },

  async fetch () {
    this.dataLoaded = false

    await this.fetchUserTokenBalance()

    this.dataLoaded = true
  },

  head () {
    return {
      title: 'Create'
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username', 'balance']),
    ...mapGetters('market', { questionData: 'question' }),

    categories () {
      return Object.keys(jsonCategories)
    },

    subCategories () {
      return Object.keys(this.subCategoryData)
    },

    questionComponent () {
      const component = this.question.replace(/-/g, '/')

      return () => import('@/components/templates/' + component + '.vue')
    }
  },

  watch: {
    category (value) {
      this.categoryData = jsonCategories[value]

      if (this.categoryData && this.categoryData.sub_category) {
        this.subCategoryData = this.categoryData.sub_category
      }

      if (value !== '') {
        this.$refs.creationWizard.nextTab()
      }
    },

    subCategory (value) {
      this.marketType = ''
      this.marketTypeData = this.subCategoryData[value].types
    },

    marketType (value) {
      const id = `${this.category}-${this.subCategory.replace(/\s&*|\(|\)/g, '')}-${this.marketType}`.toLowerCase()

      this.questionsData = jsonQuestions[id] || []

      if (this.questionsData && this.questionsData.length > 0) {
        this.question = this.questionsData[0].id
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
    ...mapMutations('market', ['SET_QUESTION_DATA']),
    ...mapActions('market', ['requestCreateMarket']),
    ...mapActions('user', ['fetchUserTokenBalance']),

    createMarket () {
      return this.requestCreateMarket()
    },

    format,

    getCategoyIcon (category) {
      return jsonCategories[category].icon
    },

    getSubCategoyIcon (subCategory) {
      if (this.subCategoryData[subCategory]) {
        return this.subCategoryData[subCategory].icon
      }
    },

    disableNext (index) {
      if (index === 0 && (!this.category || this.category === '')) {
        return true
      } else if (index === 1 && (!this.subCategory || this.subCategory === '')) {
        return true
      } else if (index === 2 && (!this.marketType || this.marketType === '')) {
        return true
      } else if (index === 3 && (!this.questionsData || this.questionsData.length === 0)) {
        return true
      }

      return false
    },

    formValidated (data) {
      this.SET_QUESTION_DATA({ category: this.category, sub_category: this.subCategory, type: this.marketType, template: this.question, ...data })
    },

    validateForm (name) {
      const refToValidate = this.$refs[name]

      return refToValidate.validate()
    },

    tabOnChange (prev, next) {
      if (prev === 1 && next === 0) {
        this.category = ''
      }
    }
  }
}
</script>

<style lang="scss">
</style>
