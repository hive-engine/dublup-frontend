<template>
  <b-modal id="sellSharesModal" title="Sell Shares">
    <b-form-group label="Outcome">
      <select id="sell-outcome" v-model="outcome" name="sell-outcome" class="custom-select" :class="$v.outcome.$dirty ? $v.outcome.$error? 'is-invalid' :'is-valid' : null">
        <option v-for="[k, v] of Object.entries(getUserGroupedShares)" :key="k" :value="k">
          {{ k }} ({{ v.length }} SHARES)
        </option>
      </select>
    </b-form-group>

    <b-form-group label="Quantity" description="Maximum of 50 shares can be sold in one transaction">
      <b-input-group>
        <b-form-input
          v-model.number="quantity"
          type="number"
          step="1"
          min="1"
          :max="maxQuantity"
          :state="$v.quantity.$dirty ? !$v.quantity.$error : null"
        />

        <template #append>
          <b-input-group-text>SHARES</b-input-group-text>
        </template>
      </b-input-group>
    </b-form-group>

    <b-form-group label="Price / Share">
      <b-input-group>
        <b-form-input v-model.number="price" type="number" step="any" :state="$v.price.$dirty ? !$v.price.$error : null" />

        <template #append>
          <b-input-group-text>{{ settings.currency }}</b-input-group-text>
        </template>
      </b-input-group>
    </b-form-group>

    <template #modal-footer>
      <b-button variant="primary" @click.prevent="sellShares">
        Sell
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import { required, numeric, minValue, maxValue, decimal } from 'vuelidate/lib/validators'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'SellShares',

  data () {
    return {
      outcome: null,
      quantity: '',
      price: ''
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['username', 'isAuthenticated']),
    ...mapGetters('market', ['market', 'instances']),

    getUserShares () {
      const self = this

      if (!this.isAuthenticated) {
        return []
      }

      return this.instances.filter(i => i.account === self.username && !i.for_sale)
    },

    getUserGroupedShares () {
      return this.getUserShares.reduce((acc, cur) => {
        acc[cur.outcome] = [...acc[cur.outcome] || [], cur]

        return acc
      }, {})
    },

    maxQuantity () {
      if (!this.outcome) { return 0 }

      return this.getUserGroupedShares[this.outcome].length
    }
  },

  mounted () {
    const self = this

    this.$root.$on('bv::modal::hidden', (bvEvent, modalId) => {
      if (modalId === 'sellSharesModal') {
        self.$v.$reset()

        self.outcome = null
        self.quantity = ''
        self.price = ''
      }
    })
  },

  methods: {
    ...mapActions('market', ['requestSellShares']),

    sellShares () {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.requestSellShares({
          outcome: this.outcome,
          quantity: this.quantity,
          price: this.price
        })

        this.$bvModal.hide('sellSharesModal')
      }
    }
  },

  validations: {
    outcome: {
      required
    },

    quantity: {
      required,
      numeric,
      minValue: minValue(1),
      maxValue: maxValue(50)
    },

    price: {
      required,
      decimal
    }
  }
}
</script>

<style>

</style>
