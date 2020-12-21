export const state = () => ({
  transactions: []
})

export const getters = {
  transactions: state => state.transactions
}

export const mutations = {
  SET_TRANSACTIONS (state, data) {
    state.transactions = data
  }
}

export const actions = {
  async fetchTransactions ({ commit }, query) {
    try {
      let transactions = await this.$API.call('transactions/history', query)

      transactions = transactions.map(t => ({ ...t, data: JSON.parse(t.data) }))

      commit('SET_TRANSACTIONS', transactions)
    } catch (e) {
      console.log(e.message)
    }
  }
}
