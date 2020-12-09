<template>
  <b-modal id="manageFriendship" size="lg" title="Members" hide-footer>
    <add-friend />

    <b-tabs content-class="mt-3" align="center" class="mt-5" lazy>
      <b-tab title="Friends" active>
        <b-table
          borderless
          show-empty
          striped
          :fields="fields"
          :items="computedFriends"
        >
          <template #cell(actions)="data">
            <b-button
              size="sm"
              title="Remove from Friends"
              variant="danger"
              @click.prevent="removeFriendship(data.item.username)"
            >
              <v-icon name="user-minus" />
            </b-button>
          </template>
        </b-table>
      </b-tab>

      <b-tab title="Blocked">
        <b-table
          borderless
          show-empty
          striped
          :fields="fields"
          :items="computedBlocked"
        >
          <template #cell(actions)="data">
            <b-button
              size="sm"
              title="Unblock"
              variant="danger"
              @click.prevent="unblockUser(data.item.username)"
            >
              <v-icon name="user-x" />
            </b-button>
          </template>
        </b-table>
      </b-tab>

      <b-tab>
        <template #title>
          Friend Requests
          <b-badge v-if="friend_requests.length > 0" variant="danger">
            {{ friend_requests.length }}
          </b-badge>
        </template>

        <b-table
          borderless
          show-empty
          striped
          :fields="fields"
          :items="friend_requests"
        >
          <template #cell(actions)="data">
            <b-button
              size="sm"
              title="Accept Friend Request"
              variant="success"
              @click.prevent="acceptFriendship(data.item.id)"
            >
              <v-icon name="user-check" />
            </b-button>
            <b-button
              size="sm"
              title="Reject Friend Request"
              variant="danger"
              @click.prevent="rejectFriendship(data.item.id)"
            >
              <v-icon name="x" />
            </b-button>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import AddFriend from '@/components/chat/AddFriend.vue'

export default {
  name: 'Friendlist',

  components: {
    AddFriend
  },

  data () {
    return {
      fields: [
        { key: 'username', label: '' },
        { key: 'actions', label: '' }
      ]
    }
  },

  async fetch () {
    await Promise.all([
      this.fetchFriends(),
      this.fetchFriendRequests()
    ])
  },

  computed: {
    ...mapGetters('message', ['friends', 'blocked', 'friend_requests']),

    computedFriends () {
      return this.friends.map(user => ({ username: user }))
    },

    computedBlocked () {
      return this.blocked.map(user => ({ username: user }))
    }
  },

  methods: {
    ...mapActions('message', ['broadcastMessage', 'fetchFriends', 'fetchFriendRequests']),

    acceptFriendship (id) {
      this.broadcastMessage({ type: 'accept-friendship', payload: { id } })
    },

    rejectFriendship (id) {
      this.broadcastMessage({ type: 'reject-friendship', payload: { id } })
    },

    removeFriendship (username) {
      this.broadcastMessage({ type: 'remove-friendship', payload: { username } })
    },

    unblockUser (username) {
      this.broadcastMessage({ type: 'unblock-user', payload: { username } })
    }
  }
}
</script>

<style scoped>
.icon {
  width: 16px;
}
</style>
