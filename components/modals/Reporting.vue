<template>
  <b-modal v-if="market.template" id="reportingModal" size="lg" title="Settle Market" lazy>
    <h6>
      Resolution Details
    </h6><hr>
    <ResolutionRules :template="market.template" :rules="market.rules ? market.rules : []" />

    <h6 class="mt-3">
      Outcomes
    </h6><hr>
    <b-form-group class="mt-3" description="You can only report one market once. Select 'Invalid' if you think the market was ambiguous.">
      <b-form-radio-group
        id="reporting-filter"
        v-model="outcome"
        :options="[...Object.keys(market.possible_outcomes), 'Invalid']"
        name="reporting-filters"
        stacked
        :state="$v.outcome.$dirty ? !$v.outcome.$error : null"
      />
    </b-form-group>

    <template #modal-footer>
      <b-button variant="primary" @click.prevent="reportMarket">
        Encrypt & Broadcast
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import ResolutionRules from '@/components/ResolutionRules.vue'

export default {
  name: 'ReportingModal',

  components: {
    ResolutionRules
  },

  data () {
    return {
      outcome: null
    }
  },

  computed: {
    ...mapGetters('market', ['market'])
  },

  mounted () {
    const self = this

    this.$root.$on('bv::modal::hide', (bvEvent, modalId) => {
      if (modalId === 'reportingModal') {
        self.$v.$reset()

        self.outcome = null
      }
    })
  },

  methods: {
    ...mapActions('market', ['requestMarketReporting']),

    reportMarket () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        return this.requestMarketReporting({ market: this.market.id, outcome: this.outcome })
      }
    }
  },

  validations: {
    outcome: {
      required
    }
  }
}
</script>

<style>

</style>
