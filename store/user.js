import { PrivateKey, cryptoUtils } from '@/services/hive'

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
  profile: null
})

export const getters = {
  username: state => state.username,
  isAuthenticated: state => state.authenticated,
  isAdmin: state => state.admin,
  isOracle: (state) => {
    if (state.profile && state.profile.oracle !== undefined) {
      return state.profile.oracle
    }

    return false
  },
  profile: state => state.profile,
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
      const { token, oracle, admin } = await this.$API.call('users/login', { username, ts, sig })

      commit('SET_USER', { username, admin, oracle, authenticated: true, smartlock, token })

      await dispatch('message/beeChatLogin', { username, ts, sig }, { root: true })
      await dispatch('fetchUserTokenBalance')

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
      token: null
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
  }
}
