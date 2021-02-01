export const state = () => ({
  market: null
})

export const getters = {
  market: state => state.market
}

export const mutations = {
  SET_MARKET_DATA (state, data) {
    state.market = data
  }
}

export const actions = {
  async fetchMarket ({ commit }, id) {
    try {
      commit('SET_MARKET_DATA', null)

      const market = await this.$API.call('markets/info', { id })

      commit('SET_MARKET_DATA', market)
    } catch (e) {
      console.log(e)
    }
  },

  requestHideMarket ({ rootState, dispatch, commit }, marketId) {
    const json = { action: 'hide-market', payload: { market_id: marketId } }

    const jsonData = {
      id: rootState.settings.app_id,
      key: 'Active',
      data: json,
      message: 'Hide Market',
      eventName: 'hide-market-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestUpdateSettings ({ rootState, dispatch, commit }, payload) {
    const json = { action: 'update-settings', payload }

    const jsonData = {
      id: rootState.settings.app_id,
      key: 'Active',
      data: json,
      message: 'Update Settings',
      eventName: 'update-settings-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  }
}
