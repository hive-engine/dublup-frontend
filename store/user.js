import { Asset, PrivateKey, cryptoUtils, getClient } from '@/services/hive'

const toFixedWithoutRounding = (t, l = 3) => {
  const a = 10 ** l
  const s = t * a
  return Math.trunc(s) / a
}

export const state = () => ({
  username: '',
  authenticated: false,
  admin: false,
  smartlock: false,
  token: null,
  balance: {
    balance: 0,
    stake: 0
  },
  notifications: [],
  profile: null
})

export const getters = {
  username: state => state.username,
  isAuthenticated: state => state.authenticated,
  isAdmin: state => state.admin,
  isOracle: (state) => {
    if (state.profile && state.profile.oracle !== undefined) {
      return state.profile.oracle.registered
    }

    return false
  },
  profile: state => state.profile,
  notifications: state => state.notifications,
  balance: state => state.balance,
  token: state => state.token
}

export const mutations = {
  SET_USER (state, data) {
    state.username = data.username
    state.authenticated = data.authenticated
    state.token = data.token
    state.admin = data.admin
    state.oracle = data.oracle

    if (data.smartlock !== undefined) {
      state.smartlock = data.smartlock
    }
  },

  SET_PROFILE (state, data) {
    state.profile = data
  },

  SET_TOKEN (state, data) {
    state.token = data
  },

  SET_NOTIFICATIONS: (state, data) => {
    state.notifications = data
  },

  SET_TOKEN_BALANCE (state, data) {
    state.balance = data
  }
}

export const actions = {
  login ({ dispatch }, { username, redirect = null }) {
    if (!username) { return }

    if (!window.hive_keychain) { return }

    const ts = Date.now()

    window.hive_keychain.requestSignBuffer(username, `${username}${ts}`, 'Posting', async (r) => {
      if (r.success) {
        await dispatch('processLogin', { username, ts, sig: r.result, smartlock: false, redirect })
      }
    })
  },

  async loginWithKey ({ dispatch }, { username, wif, redirect = null }) {
    if (!username) { return }

    if (!wif || !localStorage.getItem(`smartlock-${username}`)) {
      return
    }

    wif = wif || localStorage.getItem(`smartlock-${username}`)

    try {
      const ts = Date.now()
      const key = (wif.length > 51) ? atob(wif) : wif
      const privateKey = PrivateKey.fromString(key)
      const sig = privateKey.sign(Buffer.from(cryptoUtils.sha256(username + ts))).toString()

      await dispatch('processLogin', { username, ts, sig, smartlock: true, redirect })
    } catch (e) {
      console.log(e)
    }
  },

  async processLogin ({ commit, dispatch }, { username, ts, sig, smartlock, redirect }) {
    try {
      const { token, oracle, banned, admin } = await this.$API.call('users/login', { username, ts, sig })

      commit('SET_USER', { username, admin, oracle, authenticated: true, smartlock, token })
      commit('SET_PROFILE', { token, oracle, banned, admin })

      await Promise.all([
        dispatch('message/beeChatLogin', { username, ts, sig }, { root: true }),
        dispatch('fetchUserTokenBalance'),
        dispatch('fetchNotifications')
      ])

      localStorage.setItem('username', username)

      if (redirect) {
        this.$router.push(redirect)
      }
    } catch {
      //
    }
  },

  logout ({ state, commit, rootState }) {
    localStorage.removeItem('username')
    localStorage.removeItem('token')
    localStorage.removeItem(`smartlock-${state.username}`)

    commit('SET_USER', {
      username: '',
      admin: false,
      oracle: false,
      authenticated: false,
      smartlock: false,
      token: null,
      profile: null
    })

    commit('SET_TOKEN_BALANCE', { balance: 0, stake: 0 })

    if (rootState.socket.isConnected) {
      this.$websocket.$disconnect()
    }

    this.$router.push('/')
  },

  async fetchUser ({ commit, state }) {
    try {
      const user = await this.$API.call('users/info', { username: state.username })

      if (user) {
        commit('SET_PROFILE', user)
      }
    } catch {
      //
    }
  },

  async fetchNotifications ({ state, commit }) {
    try {
      const data = await this.$API.call('users/notifications')

      const notifications = data.map(d => ({ ...d, data: JSON.parse(d.data) }))
      commit('SET_NOTIFICATIONS', notifications)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchUserTokenBalance ({ commit, state, rootState }, username = null) {
    try {
      const [tokenBal] = await this.$sidechain.getBalances(username || state.username, rootState.settings.currency)

      if (tokenBal) {
        tokenBal.balance = Number(tokenBal.balance) || 0
        tokenBal.stake = Number(tokenBal.stake)

        commit('SET_TOKEN_BALANCE', tokenBal)
      }
    } catch (e) {
      console.error(e)
    }
  },

  requestRegisterOracle ({ rootState, dispatch }) {
    const json = { action: 'register-oracle', payload: {} }

    const jsonData = {
      id: rootState.settings.app_id,
      key: 'Active',
      data: json,
      message: 'Register Oracle',
      eventName: 'register-oracle-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestActivateOracle ({ rootState, dispatch }, activate) {
    const json = { action: 'activate-oracle', payload: { activate } }

    const jsonData = {
      id: rootState.settings.app_id,
      key: 'Active',
      data: json,
      message: `${activate ? 'Enable' : 'Disable'} Oracle`,
      eventName: 'activate-oracle-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestHEDeposit ({ state, rootState }, amount) {
    const memo = JSON.stringify({
      id: rootState.settings.sidechain_id,
      json: {
        contractName: 'hivepegged',
        contractAction: 'buy',
        contractPayload: {}
      }
    })

    if (state.smartLock) {
      const { username } = state
      const client = getClient()

      this.$router.app.$root.$bvModal.msgBoxConfirm('Are you sure?', {
        centered: true,
        okVariant: 'success',
        okTitle: 'Yes'
      })
        .then(async (value) => {
          if (value) {
            try {
              const wif = localStorage.getItem(`smartlock-${username}`)
              const key = (wif.length > 51) ? atob(wif) : wif
              const privateKey = PrivateKey.fromString(key)

              await client.broadcast.transfer({
                from: username,
                to: 'honey-swap',
                amount: Asset.from(amount, 'HIVE'),
                memo
              }, privateKey)

              this.$eventBus.$emit('he-deposit-request-successful')
            } catch (e) {
              console.log(e.message)
            }
          }
        })
        .catch((e) => {
          console.log(e.message)
        })
    } else {
      window.hive_keychain.requestTransfer(state.username, 'honey-swap', Number(amount).toFixed(3), memo, 'HIVE', (r) => {
        if (r.success) {
          this.$eventBus.$emit('he-deposit-request-successful')
        }
      }, true)
    }
  },

  requestHEWithdrawal ({ rootState, dispatch }, amount) {
    const json = {
      contractName: 'hivepegged',
      contractAction: 'withdraw',
      contractPayload: {
        quantity: toFixedWithoutRounding(amount).toFixed(3)
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Withdraw',
      eventName: 'he-withdrawal-request-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestSwapTokens ({ rootState, dispatch }, { tokenPair, tokenSymbol, tokenAmount }) {
    const json = {
      contractName: 'marketpools',
      contractAction: 'swapTokens',
      contractPayload: {
        tokenPair,
        tokenSymbol,
        tokenAmount: tokenAmount.toString(),
        tradeType: 'exactInput',
        maxSlippage: '10'
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: `Swap Tokens (${tokenPair})`,
      eventName: 'he-swap-request-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  async markNotificationsAsRead ({ state, commit }) {
    try {
      await this.$API.$post('users/notifications', { ids: state.notifications.map(n => n.id) })

      commit('SET_NOTIFICATIONS', [])
    } catch (e) {
      console.log(e.message)
    }
  }
}
