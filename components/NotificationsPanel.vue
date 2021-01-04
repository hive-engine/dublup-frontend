<template>
  <div id="notifications" class="notifications-panel">
    <div class="dropdown-header">
      Notifications
      <a
        v-if="notifications.length > 0"
        href="#"
        class="float-right"
        @click.prevent="markNotificationsAsRead"
      >Mark all as read</a>
    </div>

    <p v-if="notifications.length <= 0" class="notifications-empty">
      No new notifications.
    </p>

    <div v-else class="notification-list">
      <b-media
        v-for="(n, i) of notifications"
        :key="i"
        no-body
        class="notification"
      >
        <b-media-aside vertical-align="center" class="notification-icon">
          <div :class="`rounded-icon ${n.type}`">
            <v-icon v-if="n.type === 'oracle'" name="code" />
            <v-icon v-else-if="n.type === 'market-close'" name="tag" />
            <v-icon v-else name="dollar-sign" />
          </div>
        </b-media-aside>

        <b-media-body>
          <template v-if="n.type === 'reward'">
            You received {{ n.data.quantity }} {{ n.data.symbol }} participation reward.
          </template>

          <template v-if="n.type === 'creator-reward'">
            You received {{ n.data.quantity }} {{ n.data.symbol }} creator reward.
          </template>

          <template v-if="n.type === 'oracle-reward'">
            You received {{ n.data.quantity }} {{ n.data.symbol }} oracle reward.
          </template>

          <template v-if="n.type === 'market-buy'">
            You bought {{ n.data.nfts.length }} SHARES from @{{ n.data.seller }} for {{ n.data.payment }} {{ n.data.symbol }}.
          </template>

          <template v-if="n.type === 'market-sell'">
            You sold {{ n.data.nfts.length }} SHARES to @{{ n.data.buyer }} for {{ n.data.payment }} {{ n.data.symbol }}.
            </p>
          </template>

          <template v-if="n.type === 'market-close'">
            Your market closed.
          </template>

          <template v-if="n.type === 'oracle'">
            You are selected to settle a market.
          </template>

          <p class="m-0 small text-muted">
            Market: <nuxt-link :to="{name:'market-market', params:{market: n.data.market}}">
              {{ n.data.market }}
            </nuxt-link>
          </p>

          <timeago class="text-muted small" :datetime="new Date(n.timestamp)" :auto-update="60" />
        </b-media-body>
      </b-media>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Notifications',

  computed: {
    ...mapGetters('user', ['notifications'])
  },

  methods: {
    ...mapActions('user', ['markNotificationsAsRead'])
  }
}
</script>

<style>
</style>
