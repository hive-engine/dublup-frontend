const { memo } = require('@hiveio/hive-js')
const { utils: { sleep } } = require('@/services/hive')

const toFixedWithoutRounding = (t, l = 3) => {
  const a = 10 ** l
  const s = t * a
  return Math.trunc(s) / a
}

const generateOutcomesPtc = (outcomes, totalShares) => {
  return Object.keys(outcomes).reduce((acc, cur) => {
    acc[cur] = toFixedWithoutRounding((outcomes[cur] / totalShares) * 100, 2)

    if (Number.isNaN(acc[cur])) {
      acc[cur] = 0
    }

    return acc
  }, {})
}

const requestKeychainEncode = (account, receiver, message) => {
  return new Promise((resolve, reject) => {
    window.hive_keychain.requestEncodeMessage(account, receiver, `#${message}`, 'Active', (r) => {
      if (r.success) {
        return resolve(r.result)
      }

      return reject(r)
    })
  })
}

export const state = () => ({
  question: null,
  markets: [],
  market: {},
  instances: [],
  for_sale: [],
  search_results: [],
  queue: [],
  pagination: {
    total: 0,
    page: 0,
    limit: 0,
    pages: 0
  }
})

export const getters = {
  question: state => state.question,
  markets: state => state.markets,
  market: state => state.market,
  instances: state => state.instances,
  for_sale: state => state.for_sale,
  search_results: state => state.search_results,
  queue: state => state.queue,
  pagination: state => state.pagination
}

export const mutations = {
  SET_QUESTION_DATA (state, data) {
    state.question = data
  },

  SET_MARKETS_DATA (state, data) {
    state.markets = data
  },

  SET_MARKET_DATA (state, data) {
    state.market = data
  },

  SET_INSTANCES (state, data) {
    state.instances = data
  },

  SET_FOR_SALE (state, data) {
    state.for_sale = data
  },

  SET_SEARCH_RESULTS (state, data) {
    state.search_results = data
  },

  SET_PAGINATION (state, data) {
    state.pagination = data
  },

  ADD_TO_QUEUE (state, data) {
    state.queue = [...state.queue, data]
  },

  REMOVE_FROM_QUEUE (state, id) {
    const queue = state.queue.filter(c => c.nft_id !== id)

    state.queue = queue
  },

  EMPTY_QUEUE (state) {
    state.queue = []
  }
}

export const actions = {
  requestCreateMarket ({ rootState, dispatch, state }) {
    const json = {
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: rootState.settings.currency,
        to: rootState.settings.creation_fee_account,
        quantity: rootState.settings.creation_fee.toString(),
        memo: JSON.stringify({ action: 'create', payload: state.question })
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Create Market',
      eventName: 'create-market-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  async fetchMarkets ({ commit }, query) {
    try {
      const { results, ...pagination } = await this.$API.call('markets', query)

      const markets = results.map((m) => {
        const totalShares = Object.values(m.possible_outcomes).reduce((acc, cur) => acc + cur, 0)

        const possibleOutcomesPct = generateOutcomesPtc(m.possible_outcomes, totalShares)

        return {
          ...m,
          totalShares,
          possible_outcomes_pct: possibleOutcomesPct
        }
      })

      commit('SET_MARKETS_DATA', markets)
      commit('SET_PAGINATION', pagination)
    } catch (e) {
      console.log(e)
    }
  },

  async fetchMarket ({ commit }, id) {
    try {
      let market = await this.$API.call('markets/info', { id })

      const totalShares = Object.values(market.possible_outcomes).reduce((acc, cur) => acc + cur, 0)

      const possibleOutcomesPct = generateOutcomesPtc(market.possible_outcomes, totalShares)

      market = {
        ...market,
        totalShares,
        possible_outcomes_pct: possibleOutcomesPct
      }

      commit('SET_MARKET_DATA', market)
    } catch (e) {
      console.log(e)
    }
  },

  async fetchSearchResults ({ commit }, query) {
    try {
      const { results, ...pagination } = await this.$API.call('markets/search', query)

      const searchResults = results.map((m) => {
        const totalShares = Object.values(m.possible_outcomes).reduce((acc, cur) => acc + cur, 0)

        const possibleOutcomesPct = generateOutcomesPtc(m.possible_outcomes, totalShares)

        return {
          ...m,
          totalShares,
          possible_outcomes_pct: possibleOutcomesPct
        }
      })

      commit('SET_SEARCH_RESULTS', searchResults)
      commit('SET_PAGINATION', pagination)
    } catch (e) {
      console.log(e)
    }
  },

  requestBuyShares ({ rootState, dispatch }, { market, quantity, outcome, total }) {
    const json = {
      contractName: 'tokens',
      contractAction: 'transfer',
      contractPayload: {
        symbol: rootState.settings.currency,
        to: rootState.settings.account,
        quantity: total.toString(),
        memo: JSON.stringify({ action: 'buy', payload: { market, quantity, outcome } })
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Buy Shares',
      eventName: 'buy-shares-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestSellShares ({ state, rootState, dispatch }, { outcome, quantity, price }) {
    const nfts = state.instances.filter(c => c.account === rootState.user.username && c.outcome === outcome && !c.for_sale)
      .slice(0, quantity)
      .map(c => c.nft_id.toString())

    const json = {
      contractName: 'nftmarket',
      contractAction: 'sell',
      contractPayload: {
        symbol: rootState.settings.symbol,
        nfts,
        price: toFixedWithoutRounding(price, 3).toString(),
        priceSymbol: rootState.settings.currency,
        fee: rootState.settings.market_fee
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Sell Shares',
      eventName: 'sell-shares-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestBuyFromMarket ({ state, rootState, dispatch }, { outcome, quantity }) {
    const nfts = state.for_sale.filter(c => c.account !== rootState.user.username && c.outcome === outcome)
      .sort((a, b) => a.price - b.price)
      .slice(0, quantity)
      .map(c => c.nft_id.toString())

    const json = {
      contractName: 'nftmarket',
      contractAction: 'buy',
      contractPayload: {
        symbol: rootState.settings.symbol,
        nfts,
        marketAccount: rootState.settings.account
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Buy Shares (Market)',
      eventName: 'buy-shares-successful'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  requestCancelSale ({ state, rootState, dispatch }) {
    const nfts = state.queue.filter(c => c.account === rootState.user.username)
      .map(c => c.nft_id.toString())

    const json = {
      contractName: 'nftmarket',
      contractAction: 'cancel',
      contractPayload: {
        symbol: rootState.settings.symbol,
        nfts
      }
    }

    const jsonData = {
      id: rootState.settings.sidechain_id,
      key: 'Active',
      data: json,
      message: 'Cancel Sale',
      eventName: 'cancel-sale-shares-successful',
      mutation: 'market/EMPTY_QUEUE'
    }

    dispatch('requestCustomJson', jsonData, { root: true })
  },

  async requestMarketReporting ({ rootState, dispatch }, data) {
    let encoded = false
    const report = JSON.stringify(data)

    const jsonData = {
      id: rootState.settings.app_id,
      key: 'Active',
      data: { action: 'report-outcome', payload: {} },
      message: 'Report Outcome',
      eventName: 'report-outcome-successful'
    }

    if (rootState.user.smartlock) {
      const wif = localStorage.getItem(`smartlock-${rootState.user.username}`)
      const key = (wif.length > 51) ? atob(wif) : wif

      const payload = memo.encode(key, rootState.settings.public_key, `#${report}`)

      jsonData.data.payload = payload

      encoded = true
    } else if (window.hive_keychain) {
      try {
        const payload = await requestKeychainEncode(rootState.user.username, rootState.settings.reporting_account, report)

        jsonData.data.payload = payload

        await sleep(1000)

        encoded = true
      } catch (e) {
        console.log(e.message)
      }
    }

    if (encoded) {
      dispatch('requestCustomJson', jsonData, { root: true })
    }
  },

  async fetchNFTInstances ({ commit }, query) {
    try {
      let instances = []
      let newData = 0
      let offset = 0

      do {
        const data = await this.$sidechain.getNFTInstances(query, offset)
        newData = data.length

        if (data.length > 0) {
          instances.push(...data)
        }
        offset += 1000
      } while (newData > 0)

      instances = instances.map((c) => {
        const forSale = !!(c.account === 'nftmarket' && c.ownedBy === 'c')

        return {
          nft_id: c._id,
          account: forSale ? c.previousAccount : c.account,
          market: c.properties.market,
          outcome: c.properties.outcome,
          for_sale: forSale
        }
      })

      commit('SET_INSTANCES', instances)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchForSale ({ commit, rootState }, query) {
    try {
      let instances = []
      let newData = 0
      let offset = 0

      do {
        const data = await this.$sidechain.getNFTSellBook({ ...query, priceSymbol: rootState.settings.currency }, offset)
        newData = data.length

        if (data.length > 0) {
          instances.push(...data)
        }
        offset += 1000
      } while (newData > 0)

      instances = instances.map((c) => {
        return {
          nft_id: c.nftId,
          account: c.account,
          market: c.grouping.market,
          outcome: c.grouping.outcome,
          price: Number(c.price),
          symbol: c.priceSymbol
        }
      })

      commit('SET_FOR_SALE', instances)
    } catch (e) {
      console.log(e.message)
    }
  }
}
