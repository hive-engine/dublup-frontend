<template>
  <div class="dashboard">
    <div class="container">
      <h3>Dashboard</h3><hr>

      <b-card v-if="!isOracle" title="Become an Oracle">
        <p>Anyone having {{ settings.oracle_stake_requirement }} {{ settings.currency }} can register for being an oracle.</p>
        <p>Your current stake: {{ balance.stake }} {{ settings.currency }}</p>

        <b-button v-if="!isOracle && !oracleApplied" :disabled="balance.stake < settings.oracle_stake_requirement" variant="primary" @click.prevent="requestRegisterOracle">
          Register
        </b-button>

        <p v-else-if="oracleApplied" class="text-info">
          You have already applied to be an oracle.
        </p>
        <p v-else class="text-success">
          You are already a registered Oracle.
        </p>
      </b-card>

      <b-card v-else title="You are an Oracle!">
        <h6>Oracle Reputation: {{ profile.reputation }}</h6>
        <h6>Consecutive Misses: {{ profile.oracle.consecutive_misses }}</h6>

        <p class="text-info">
          If this reputation goes below 0, your market outcome submission won't be counted.
        </p>
        <p class="text-muted">
          Please be extremely careful while settling markets. Wrong submission reduces your reputation by {{ settings.incorrect_reporting_penalty }}, correct outcome increase it by {{ settings.correct_reporting_reward }}. If you do not participate in {{ settings.max_consecutive_misses }} consecutive market resolutions, your orcale will be temporary disabled. You can re-enable at any time without any penalty.
        </p>
      </b-card>

      <b-card v-if="isOracle" title="Oracle Settings" class="mt-5">
        <template v-if="requestReceived">
          <p class="text-sccess">
            We have received your request and now processing.
          </p>
        </template>

        <template v-else>
          <template v-if="profile.oracle.active">
            <p class="text-success h4">
              You are an active oracle.
            </p>

            <b-button variant="warning" class="mt-3" @click.prevent="requestActivateOracle(false)">
              Temporary Disable Oracle
            </b-button>
          </template>

          <template v-else>
            <p class="text-warning h4">
              You are not an active oracle.
            </p>

            <b-button variant="success" class="mt-3" @click.prevent="requestActivateOracle(true)">
              Enable Oracle
            </b-button>
          </template>
        </template>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import EventListeners from '@/mixins/events-listener'

export default {
  name: 'Dashboard',

  mixins: [EventListeners],

  middleware: 'authenticated',

  data () {
    return {
      dataLoaded: null,
      oracleApplied: false,
      requestReceived: false
    }
  },

  async fetch () {
    this.dataLoaded = false

    await this.fetchUser()

    this.dataLoaded = true
  },

  head () {
    return {
      title: 'Dashboard'
    }
  },

  computed: {
    ...mapGetters(['settings']),
    ...mapGetters('user', ['balance', 'isOracle', 'profile'])
  },

  watch: {
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

    this.$eventBus.$on(['register-oracle-successful'], () => {
      self.oracleApplied = true
    })

    this.$eventBus.$on(['activate-oracle-successful'], () => {
      self.requestReceived = true
    })

    this.$eventBus.$on(['register-oracle-notification', 'activate-oracle-notification'], async () => {
      self.oracleApplied = false
      self.requestReceived = false

      await self.$fetch()
    })
  },

  beforeMount () {
    this.$eventBus.$off(['register-oracle-successful', 'activate-oracle-successful', 'register-oracle-notification', 'activate-oracle-notification'])
  },

  methods: {
    ...mapActions('user', ['fetchUser', 'requestRegisterOracle', 'requestActivateOracle'])
  }
}
</script>

<style>

</style>
