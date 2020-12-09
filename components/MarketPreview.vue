<template>
  <b-card v-if="questionData">
    <h4>Question: {{ generateQuestion }}</h4>

    <b-row class="mt-5">
      <b-col cols="12" sm="4" class="mt-4">
        <h6>Market Type</h6>
        {{ questionData.type === "binary" ? "Yes/No" : "Categorical" }}
      </b-col>
      <b-col cols="12" sm="4" class="mt-4">
        <h6>Category</h6>
        {{ questionData.category }}
      </b-col>
      <b-col cols="12" sm="4" class="mt-4">
        <h6>Sub Category</h6>
        {{ questionData.sub_category }}
      </b-col>

      <b-col v-if="questionData.startDate" cols="12" class="mt-4">
        <h6>Estimated Start Date and Time</h6>

        <DateToUTC :datetime="questionData.startDate" />
        (UTC-0)
      </b-col>

      <b-col cols="12" class="mt-4">
        <h6>Expiration Date and Time</h6>

        <DateToUTC :datetime="questionData.expiryDate" />
        (UTC-0)
      </b-col>
    </b-row>

    <template v-if="questionData.type === 'categorical'">
      <h6 class="mt-4">
        Outcomes
      </h6>

      <ol class="outcomes-list">
        <li v-for="(outcome, i) of questionData.outcomes" :key="i">
          {{ outcome }}
        </li>
      </ol>
    </template>

    <h6 class="mt-4">
      Resolution Rules
    </h6>

    <ResolutionRules :template="questionData.template" :rules="questionData.rules" />

    <h6 class="mt-4">
      Fee
    </h6>
    <p>Creation Fee: {{ settings.creation_fee }} {{ settings.currency }}</p>

    <p>Your Balance: {{ balance.balance }}  {{ settings.currency }}</p>
  </b-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { format } from 'date-fns-tz'
import DateToUTC from '@/components/DateToUTC.vue'
import ResolutionRules from '@/components/ResolutionRules.vue'
import jsonQuestions from '@/assets/data/questions.json'

export default {
  name: 'MarketPreview',

  components: {
    DateToUTC,
    ResolutionRules
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('market', { questionData: 'question' }),
    ...mapGetters('user', ['balance']),

    generateQuestion () {
      if (!this.questionData) { return '' }

      if (this.questionData && this.questionData.question) { return this.questionData.question }

      const { category, sub_category: subCategory, type } = this.questionData

      const id = `${category}-${subCategory.replace(/\s&*|\(|\)/g, '')}-${type}`.toLowerCase()
      const questionsData = jsonQuestions[id] || []

      const question = questionsData.find(q => q.id === this.questionData.template)

      if (!question) { return }

      return question.replaceable.replace(/\[(\w+)\]/g, (match, p) => {
        if (['openDate', 'startDate', 'closeDate', 'date'].includes(p)) {
          return format(new Date(this.questionData[p]), 'MMMM dd, yyyy')
        }

        return this.questionData[p]
      })
    }
  },

  methods: {
    format
  }
}
</script>

<style>

</style>
