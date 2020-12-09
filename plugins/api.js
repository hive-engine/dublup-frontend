export default ({ store, $config, $axios }, inject) => {
  const API = $axios.create({
    baseURL: $config.API_BASE_URL,
    withCredentials: true
  })

  API.interceptors.request.use((config) => {
    if (process.client) {
      if (store.state.user.token) {
        config.headers.Authorization = `Bearer ${store.state.user.token}`
      }
    }

    return config
  })

  API.call = (endpoint, params) => {
    return API.$get(endpoint, { params })
  }

  inject('API', API)
}
