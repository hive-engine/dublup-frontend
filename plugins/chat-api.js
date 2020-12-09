export default ({ store, $config, $axios }, inject) => {
  const API = $axios.create({
    baseURL: $config.CHAT_API,
    withCredentials: true
  })

  API.onRequest((config) => {
    if (process.client) {
      if (store.state.message.token) {
        config.headers.Authorization = `Bearer ${store.state.message.token}`
      }

      const refreshToken = localStorage.getItem(`beechat-${store.state.user.username}-refresh_token`)

      if (config.url === 'users/refresh-token' && refreshToken) {
        config.headers.Authorization = `Bearer ${refreshToken}`
      }
    }

    return config
  })

  API.onResponseError(async (error) => {
    if (error.response.status !== 401) {
      return Promise.reject(error)
    }

    let successful = false

    if (error.config.url !== 'users/refresh-token') {
      try {
        console.log('Refreshing token...')

        await store.dispatch('message/refreshToken', { root: true })

        error.config.headers.Authorization = store.state.message.token
        successful = true
      } catch {
        successful = false
        Promise.reject(error)
      }
    }

    if (successful) {
      try {
        // New request with new token
        const config = error.config

        return new Promise((resolve, reject) => {
          API.request(config).then((response) => {
            resolve(response)
          }).catch((error) => {
            reject(error)
          })
        })
      } catch (error) {
        Promise.reject(error)
      }
    }
  })

  API.call = (endpoint, params) => {
    return API.$get(endpoint, { params })
  }

  inject('chatAPI', API)
}
