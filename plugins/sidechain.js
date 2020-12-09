import axios from 'axios'

export default ({ store }, inject) => {
  const call = async (endpoint, request) => {
    const postData = {
      jsonrpc: '2.0',
      id: Date.now(),
      ...request
    }

    let result = null

    const query = await axios.post(`${store.state.settings.sidechain_rpc}/${endpoint}`, postData, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

    result = query.data.result

    return result
  }

  const blockchain = request => call('blockchain', request)

  const contract = request => call('contracts', request)

  const getBalances = (account, symbol) => {
    const query = { account }
    if (symbol) { query.symbol = symbol }

    const request = {
      method: 'find',
      params: {
        contract: 'tokens',
        table: 'balances',
        query
      }
    }

    return contract(request)
  }

  const getManagedNFTInfo = (symbols) => {
    const query = { nft: symbols }

    if (Array.isArray(symbols)) { query.nft = { $in: symbols } }

    const request = {
      method: 'find',
      params: {
        contract: 'packmanager',
        table: 'managedNfts',
        query
      }
    }

    return contract(request)
  }

  const getNFT = (query = {}) => {
    query = { symbol: store.state.settings.symbol, ...query }

    const request = {
      method: 'findOne',
      params: {
        contract: 'nft',
        table: 'nfts',
        query
      }
    }

    return contract(request)
  }

  const getNFTSellBook = (query, offset = 0, limit = 1000) => {
    const symbol = query.symbol || store.state.settings.symbol

    const request = {
      method: 'find',
      params: {
        contract: 'nftmarket',
        table: `${symbol}sellBook`,
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const getNFTInterests = (query = {}, offset = 0, limit = 1000) => {
    const symbol = query.symbol || store.state.settings.symbol

    const request = {
      method: 'find',
      params: {
        contract: 'nftmarket',
        table: `${symbol}openInterest`,
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const getNFTInstances = (query, offset = 0, limit = 1000) => {
    const symbol = query.symbol || store.state.settings.symbol

    const request = {
      method: 'find',
      params: {
        contract: 'nft',
        table: `${symbol}instances`,
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const getNFTInstance = (id) => {
    const query = { symbol: store.state.settings.symbol, _id: id }

    const request = {
      method: 'findOne',
      params: {
        contract: 'nft',
        table: `${query.symbol}instances`,
        query
      }
    }

    return contract(request)
  }

  const getNFTTradeHistory = (query, offset = 0, limit = 1000) => {
    const symbol = query.symbol || store.state.settings.symbol

    const request = {
      method: 'find',
      params: {
        contract: 'nftmarket',
        table: `${symbol}tradesHistory`,
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const getRegisteredPacks = (query = {}) => {
    const request = {
      method: 'find',
      params: {
        contract: 'packmanager',
        table: 'packs',
        query
      }
    }

    return contract(request)
  }

  const getToken = (symbol) => {
    const request = {
      method: 'findOne',
      params: {
        contract: 'tokens',
        table: 'tokens',
        query: { symbol }
      }
    }

    return contract(request)
  }

  const getTokens = (query = {}, offset = 0, limit = 1000) => {
    const request = {
      method: 'find',
      params: {
        contract: 'tokens',
        table: 'tokens',
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const getTransaction = (txid) => {
    const request = {
      method: 'getTransactionInfo',
      params: {
        txid
      }
    }

    return blockchain(request)
  }

  const getTypes = (query = {}, offset = 0, limit = 1000) => {
    const request = {
      method: 'find',
      params: {
        contract: 'packmanager',
        table: 'types',
        query,
        offset,
        limit
      }
    }

    return contract(request)
  }

  const sidechain = {
    blockchain,
    contract,
    getBalances,
    getManagedNFTInfo,
    getNFT,
    getNFTInstance,
    getNFTInstances,
    getNFTSellBook,
    getNFTInterests,
    getNFTTradeHistory,
    getRegisteredPacks,
    getToken,
    getTokens,
    getTransaction,
    getTypes
  }

  inject('sidechain', sidechain)
}
