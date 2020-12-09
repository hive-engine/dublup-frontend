import { PrivateKey, cryptoUtils } from '@/services/hive'

export const state = () => ({
  conversations: [],
  conversation: null,
  channels: [],
  messages: [],
  recipient: '',
  friends: [],
  blocked: [],
  friend_requests: [],
  online: false,
  token: null
})

export const getters = {
  conversations: (state, getters, rootState, rootGetters) => {
    const { messages, conversations } = state
    const { username } = rootState.user

    return conversations
      .map(r => ({ ...r, members: r.members.filter(m => m !== username), updated_at: new Date(r.updated_at).getTime() }))
      .sort((a, b) => b.updated_at - a.updated_at)
      .reduce((acc, cur) => {
        const newMessages = messages.filter(m => m.conversation_id === cur.id &&
          (m.to === username || m.to === null) &&
          m.read === false)

        if (!cur.name) { cur.name = cur.members.join(', ') }

        acc.push({ ...cur, unread: newMessages.length })

        return acc
      }, [])
  },
  channels: (state) => {
    const { messages, channels } = state

    return channels
      .map(r => ({ ...r, updated_at: new Date(r.updated_at).getTime() }))
      .sort((a, b) => b.updated_at - a.updated_at)
      .reduce((acc, cur) => {
        const newMessages = messages.filter(m => m.conversation_id === cur.id && m.read === false)

        acc.push({ ...cur, unread: newMessages.length })

        return acc
      }, [])
  },
  messages: (state) => {
    const messages = state.messages.slice()

    return messages
      .map(m => ({ ...m, timestamp: new Date(m.timestamp).getTime() }))
      .sort((a, b) => a.timestamp - b.timestamp)
  },
  recipient: state => state.recipient,
  conversation: state => state.conversation,
  friends: state => state.friends,
  blocked: state => state.blocked,
  isOnline: state => state.online,
  friend_requests: state => state.friend_requests
}

export const mutations = {
  SET_ONLINE (state, data) {
    state.online = data
  },

  SET_TOKEN (state, data) {
    state.token = data
  },

  SET_FRIENDS (state, data) {
    state.friends = data
  },

  SET_BLOCKED (state, data) {
    state.blocked = data
  },

  SET_FRIEND_REQUESTS (state, data) {
    state.friend_requests = data
  },

  ADD_FRIEND (state, data) {
    let friends = state.friends

    friends = Array.from(new Set([...friends, data.username]))

    state.friends = friends

    this.commit('message/REMOVE_FRIEND_REQUEST', { id: data.id }, { root: true })
  },

  REMOVE_FRIEND (state, data) {
    let friends = state.friends

    friends = friends.filter(r => r !== data.username)

    state.friends = friends
  },

  ADD_FRIEND_REQUEST (state, data) {
    let requests = state.friend_requests

    if (data.username !== this.state.user.username) {
      requests = [...requests, data]

      state.friend_requests = requests
    }
  },

  REMOVE_FRIEND_REQUEST (state, data) {
    let requests = state.friend_requests

    requests = requests.filter(r => r.id !== data.id)

    state.friend_requests = requests
  },

  BLOCK_USER (state, data) {
    let blocked = state.blocked

    blocked = Array.from(new Set([...blocked, data.username]))

    state.blocked = blocked

    this.commit('message/BLOCK_CONVERSATION', { id: data.conversation_id }, { root: true })
    this.commit('message/REMOVE_FRIEND', { username: data.username }, { root: true })
  },

  UNBLOCK_USER (state, data) {
    let blocked = state.blocked

    blocked = blocked.filter(r => r !== data.username)

    state.blocked = blocked

    this.commit('message/UNBLOCK_CONVERSATION', { id: data.conversation_id }, { root: true })
  },

  SET_CONVERSATIONS (state, data) {
    state.conversations = data
  },

  SET_CONVERSATION (state, data) {
    state.conversation = data
  },

  SET_CHANNELS (state, data) {
    state.channels = data
  },

  ADD_MEMBER (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.members = Array.from(new Set([...m.members, data.username]))
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.members = Array.from(new Set([...conversation.members, data.username]))

      state.conversation = conversation
    }
  },

  REMOVE_MEMBER (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.members = m.members.filter(a => a !== data.username)
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.members = conversation.members.filter(a => a !== data.username)

      state.conversation = conversation
    }
  },

  ADD_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = [data, ...conversations].reduce((acc, cur) => {
      return Object.assign(acc, {
        [cur.id]: cur
      })
    }, {})

    state.conversations = Object.values(conversations)
  },

  RENAME_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) { m.name = data.name }

      return m
    })

    state.conversations = conversations
  },

  REMOVE_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.filter(c => c.id !== data.id)

    state.conversations = conversations
  },

  BLOCK_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.id) { m.blocked = true }

      return m
    })

    state.conversations = conversations
  },

  UNBLOCK_CONVERSATION (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.id) { m.blocked = false }

      return m
    })

    state.conversations = conversations
  },

  SET_MESSAGES (state, data) {
    state.messages = data
  },

  SET_MESSAGE (state, data) {
    const messages = state.messages
    let conversations = state.conversations

    conversations = conversations.reduce((acc, cur) => {
      if (cur.id === data.conversation_id) { cur.updated_at = data.timestamp }

      acc.push(cur)

      return acc
    }, [])

    state.messages = [...messages, data]
    state.conversations = conversations
  },

  UPDATE_MESSAGES (state, data) {
    let messages = state.messages

    messages = messages.map((m) => {
      if (m.conversation_id === data.conversation_id) { m.read = true }

      return m
    })

    state.messages = messages
  },

  REMOVE_MESSAGE (state, data) {
    let messages = state.messages

    messages = messages.filter(m => m.id !== data.id)

    state.messages = messages
  },

  MODERATOR_ADDED (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.moderators = Array.from(new Set([...m.moderators, data.username]))
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.moderators = Array.from(new Set([...conversation.moderators, data.username]))

      state.conversation = conversation
    }
  },

  MODERATOR_REMOVED (state, data) {
    let conversations = state.conversations

    conversations = conversations.map((m) => {
      if (m.id === data.conversation_id) {
        m.moderators = m.moderators.filter(a => a !== data.username)
      }

      return m
    })

    state.conversations = conversations

    if (state.conversation && state.conversation.id === data.conversation_id) {
      const conversation = state.conversation

      conversation.moderators = conversation.moderators.filter(a => a !== data.username)

      state.conversation = conversation
    }
  },

  SET_RECIPIENT (state, data) {
    state.recipient = data
  }
}

export const actions = {
  // Only for beeChat
  login ({ dispatch, rootState }) {
    if (!window.hive_keychain) { return }

    const { username } = rootState.user

    const ts = Date.now()

    window.hive_keychain.requestSignBuffer(username, `${username}${ts}`, 'Posting', async (r) => {
      if (r.success) {
        await dispatch('processBeeChatLogin', { username, ts, sig: r.result })
      }
    })
  },

  // Only for beeChat
  async loginWithKey ({ rootState, dispatch }) {
    const { username } = rootState.user
    const wif = localStorage.getItem(`smartlock-${username}`)

    if (!username || !wif) { return }

    try {
      const ts = Date.now()
      const key = (wif.length > 51) ? atob(wif) : wif
      const privateKey = PrivateKey.fromString(key)
      const sig = privateKey.sign(Buffer.from(cryptoUtils.sha256(username + ts))).toString()

      await dispatch('processBeeChatLogin', { username, ts, sig })
    } catch {
      //
    }
  },

  async processBeeChatLogin ({ commit, dispatch, rootState }, { username, ts, sig }) {
    try {
      const data = await this.$chatAPI.call('users/login', { username, ts, sig })

      commit('SET_TOKEN', data.token)

      localStorage.setItem(`beechat-${username}-refresh_token`, data.refresh_token)

      if (!rootState.socket.isConnected) {
        this.$websocket.$connect()
      } else {
        dispatch('authenticateWebsocket', { token: data.token })
      }

      await dispatch('fetchNewMessages')
    } catch {
      //
    }
  },

  async fetchConversations ({ commit }) {
    try {
      const conversations = await this.$chatAPI.call('messages/conversations')

      commit('SET_CONVERSATIONS', conversations)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchConversation ({ commit }, convId) {
    try {
      const conversation = await this.$chatAPI.call('messages/conversation', { id: convId })

      commit('SET_CONVERSATION', conversation)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchChannels ({ commit }, ids) {
    try {
      const channels = await this.$chatAPI.call('messages/conversation', { ids: ids.toString() })

      commit('SET_CHANNELS', channels)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchNewMessages ({ commit }) {
    try {
      const messages = await this.$chatAPI.call('messages/new')

      commit('SET_MESSAGES', messages)
    } catch (e) {
      console.log(e.message)
    }
  },

  async fetchMessages ({ commit, state }, { conversation_id: convId, before = null }) {
    try {
      const query = { conversation_id: convId }

      if (before) { query.before = new Date(before).getTime() }

      let messages = await this.$chatAPI.call('messages/chats', query)

      messages = [...state.messages, ...messages].reduce((acc, cur) => {
        return Object.assign(acc, {
          [cur.id]: cur
        })
      }, {})

      messages = Object.values(messages)

      commit('SET_MESSAGES', messages)
    } catch (e) {
      console.log(e.message)
    }
  },

  broadcastChat ({ dispatch }, { conversation_id: convId = undefined, to, message }) {
    dispatch('wsSendMessage', { type: 'chat-message', payload: { conversation_id: convId, to, message } }, { root: true })
  },

  broadcastMessage ({ dispatch }, payload) {
    dispatch('wsSendMessage', payload, { root: true })
  },

  requestNewMessage ({ commit }, recipient) {
    commit('SET_RECIPIENT', recipient)
    this.$router.app.$root.$bvModal.show('createConversation')
  },

  authenticateWebsocket ({ dispatch }, payload = {}) {
    try {
      dispatch('wsSendMessage', { type: 'authenticate', payload }, { root: true })
    } catch {
      ///
    }
  },

  async beeChatLogin ({ commit, state, rootState, dispatch }, { username, ts, sig }) {
    let beeChatLoggedin = false

    try {
      const data = await this.$chatAPI.call('users/refresh-token')

      commit('SET_TOKEN', data.token)

      beeChatLoggedin = true
    } catch {
      //
    }

    if (!beeChatLoggedin) {
      try {
        const data = await this.$chatAPI.call('users/login', {
          username,
          ts,
          sig
        })

        commit('SET_TOKEN', data.token)

        localStorage.setItem(`beechat-${username}-refresh_token`, data.refresh_token)

        beeChatLoggedin = true
      } catch (e) {
        console.log(e.message)
      }
    }

    if (beeChatLoggedin) {
      if (!rootState.socket.isConnected) {
        console.log('Connecting websocket...')
        this.$websocket.$connect()
      } else {
        dispatch('authenticateWebsocket', { token: state.token })
      }
    }
  },

  async loginVerify ({ commit, rootState, dispatch }) {
    try {
      await this.$chatAPI.call('users/verify')

      if (!rootState.socket.isConnected) {
        this.$websocket.$connect()
      } else {
        dispatch('authenticateWebsocket', { token: state.token })
      }
    } catch {
      //
    }
  },

  async refreshToken ({ state, commit, rootState, dispatch }) {
    try {
      const data = await this.$chatAPI.call('users/refresh-token')

      commit('SET_TOKEN', data.token)

      if (!rootState.socket.isConnected) {
        this.$websocket.$connect()
      } else {
        dispatch('authenticateWebsocket', { token: state.token })
      }
    } catch {
      if (rootState.user.authenticated && rootState.user.username && rootState.user.username !== '') {
        if (rootState.user.smartlock) {
          dispatch('loginWithKey')
        } else {
          dispatch('login')
        }
      }
    }
  },

  async fetchFriends ({ commit }) {
    try {
      const { friends, blocked } = await this.$chatAPI.call('users/friends')

      commit('SET_FRIENDS', friends)
      commit('SET_BLOCKED', blocked)
    } catch (e) {
      //
    }
  },

  async fetchFriendRequests ({ commit }) {
    try {
      const requests = await this.$chatAPI.call('users/friend-requests')

      commit('SET_FRIEND_REQUESTS', requests)
    } catch (e) {
      //
    }
  },

  async fetchSettings ({ commit }) {
    try {
      const settings = await this.$chatAPI.call('users/settings')

      commit('SET_SETTINGS', settings)
    } catch (e) {
      console.log(e)
    }
  },

  async saveSettings ({ commit }, data) {
    try {
      const settings = await this.$chatAPI.$post('users/settings', data)

      commit('SET_SETTINGS', settings)
    } catch (e) {
      //
    }
  }
}
