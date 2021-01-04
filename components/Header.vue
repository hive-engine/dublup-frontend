<template>
  <div class="header">
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-container>
        <b-navbar-brand to="/">
          Predict.Land
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-form class="navbar-search-form" @submit.prevent="search">
              <b-input-group>
                <b-form-input v-model="q" placeholder="Search" />

                <template #append>
                  <b-button type="submit" class="search-button">
                    <v-icon name="search" />
                  </b-button>
                </template>
              </b-input-group>
            </b-nav-form>
          </b-navbar-nav>

          <b-navbar-nav class="ml-auto">
            <b-nav-item
              v-if="!isAuthenticated"
              @click.prevent="$bvModal.show('loginModal')"
            >
              <v-icon name="user" />&nbsp; Login
            </b-nav-item>

            <template v-if="isAuthenticated">
              <b-nav-item :to="{ name: 'create' }">
                <v-icon name="edit-3" />&nbsp; Create
              </b-nav-item>

              <b-nav-item v-if="isOracle" :to="{ name: 'report' }">
                <v-icon name="code" />&nbsp; Settle Markets
              </b-nav-item>

              <b-nav-item :to="{ name: 'user-dashboard', params: { user: username } }">
                <v-icon name="wind" />&nbsp; Dashboard
              </b-nav-item>

              <b-nav-item
                :to="{ name: 'user-messages', params: { user: username } }"
              >
                <v-icon name="message-square" />&nbsp; Messages
                <b-badge v-if="newMessages > 0" pill variant="warning">
                  {{ newMessages }}
                </b-badge>
              </b-nav-item>

              <b-nav-item-dropdown
                right
                no-caret
                menu-class="notifications-dropdown"
                title="Notifications"
                toggle-class="badge-holder"
              >
                <template #button-content>
                  <v-icon name="bell" />
                  <span class="d-lg-none">Notification</span>
                  <b-badge
                    v-if="notifications.length > 0"
                    class="navbar-badge"
                    pill
                    variant="primary"
                  >
                    {{ notifications.length }}
                  </b-badge>
                </template>
                <NotificationsPanel />
              </b-nav-item-dropdown>

              <b-nav-item-dropdown right>
                <template #button-content>
                  <v-icon name="user" />&nbsp; {{ username }}
                </template>
                <b-dropdown-item v-if="isAdmin" :to="{name:'admin'}">
                  Admin Dashboard
                </b-dropdown-item>
                <b-dropdown-item :to="{name:'user-markets', params:{user: username}}">
                  Your Markets
                </b-dropdown-item>
                <b-dropdown-item :to="{name:'user-transactions', params:{user: username}}">
                  Transaction History
                </b-dropdown-item>
                <b-dropdown-item @click.prevent="logout">
                  Logout
                </b-dropdown-item>
              </b-nav-item-dropdown>
            </template>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import NotificationsPanel from '@/components/NotificationsPanel.vue'

export default {
  name: 'Header',

  components: {
    NotificationsPanel
  },

  data () {
    return {
      q: ''
    }
  },

  computed: {
    ...mapGetters('cart', ['cart']),
    ...mapGetters('queue', ['queue']),
    ...mapGetters('user', ['isAuthenticated', 'isOracle', 'isAdmin', 'username', 'notifications']),
    ...mapGetters('message', ['conversations']),

    newMessages () {
      return this.conversations.reduce((acc, cur) => acc + cur.unread, 0)
    }
  },

  methods: {
    ...mapActions('user', ['logout']),

    search () {
      if (this.q !== '') {
        this.$router.push({ name: 'search', query: { q: this.q } })
      }
    }
  }
}
</script>

<style>
</style>
