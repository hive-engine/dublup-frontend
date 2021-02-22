<template>
  <div class="login">
    <b-modal id="loginModal" title="Login to Dublup" hide-footer centered>
      <template #default>
        <div class="pt-md-3 pb-md-3 pr-md-5 pl-md-5">
          <div class="form-group">
            <b-form-input
              v-model.trim="username"
              placeholder="Hive username"
              @keyup.enter="logMeIn"
            />
          </div>

          <div class="text-center">
            <div class="login_buttons">
              <b-button variant="success" block @click="logMeIn">
                Login with HIVE Keychain
              </b-button>

              <b-button
                variant="secondary"
                block
                @click.prevent="$bvModal.show('smartLock')"
              >
                Login with SmartLock
              </b-button>
            </div>
            <template v-if="!isKeychain">
              <hr>
              <p class="small mt-3 mb-0">
                Download Hive Keychain for
              </p>

              <ul class="list-inline">
                <li class="list-inline-item">
                  <a href="https://chrome.google.com/webstore/detail/hive-keychain/jcacnejopjdphbnjgfaaobbfafkihpep" target="_blank">Google Chrome/Opera/Brave</a>
                </li>
                <li class="list-inline-item">
                  <a href="https://addons.mozilla.org/en-GB/firefox/addon/hive-keychain/" target="_blank">Firefox</a>
                </li>
              </ul>
            </template>
          </div>
        </div>
      </template>
    </b-modal>

    <SmartLock :callback="smartLockLogin" />
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import SmartLock from '@/components/smartlock/SmartLock.vue'

export default {
  name: 'LoginModal',

  components: {
    SmartLock
  },

  data () {
    return {
      username: '',
      password: ''
    }
  },

  computed: {
    ...mapGetters('user', ['isAuthenticated']),

    isKeychain () {
      return !!(window.hive_keychain)
    }
  },

  async beforeMount () {
    const self = this
    const username = localStorage.getItem('username')

    if (username) {
      const wif = localStorage.getItem(`smartlock-${username}`)

      if (wif) {
        await this.smartLockLogin(username, wif)
      } else if (!window.hive_keychain) {
        new Promise(resolve => setTimeout(resolve, 500)).then(() => {
          if (!window.hive_keychain) {
            new Promise(resolve => setTimeout(resolve, 1000)).then(() => {
              if (!window.hive_keychain) {
                return
              }

              self.logMeIn(username)
            })
          } else {
            self.logMeIn(username)
          }
        })
      } else {
        self.logMeIn(username)
      }
    }
  },

  mounted () {
    this.$root.$on('smartock-loggedin', () => {
      this.$root.$bvModal.hide('loginModal')
    })
  },

  methods: {
    ...mapActions('user', ['login', 'loginWithKey']),

    async logMeIn (username) {
      if (window.hive_keychain) {
        const data = {
          username: this.username || username
        }

        if (this.$route.query.redirect) {
          data.redirect = this.$route.query.redirect
        }

        await this.login(data)
      }

      this.$bvModal.hide('loginModal')
    },

    async smartLockLogin (username, wif) {
      const data = { username, wif }

      if (this.$route.query.redirect) {
        data.redirect = this.$route.query.redirect
      }

      await this.loginWithKey(data)
    }
  }
}
</script>

<style>
</style>
