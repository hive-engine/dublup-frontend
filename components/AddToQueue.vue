<template>
  <div class="add-to-queue">
    <template v-if="queueItemExist(data.nft_id)">
      <b-button
        title="Use SHIFT + CLICK to remove multiple items"
        size="sm"
        variant="danger"
        @click="removeFromQueue(data.nft_id, $event)"
      >
        <v-icon name="minus" />
      </b-button>
    </template>
    <template v-else>
      <b-button
        :title="!isAuthenticated ? 'Please login to use this function.' : 'Use SHIFT + CLICK to add multiple items'"
        size="sm"
        variant="primary"
        :disabled="maximumQuantityReached() || !isAuthenticated"
        @click="addToQueue({
          nft_id: data.nft_id,
          market: data.market,
          outcome: data.outcome,
          price: data.price || 0,
          symbol: data.symbol,
          account: data.account }, $event)"
      >
        <v-icon name="plus" />
      </b-button>
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'AddToQueue',

  props: {
    items: { type: Array, required: true },
    data: { type: Object, required: true }
  },

  computed: {
    ...mapGetters('market', ['queue']),
    ...mapGetters('user', ['isAuthenticated', 'username'])
  },

  methods: {
    ...mapMutations('market', ['ADD_TO_QUEUE', 'REMOVE_FROM_QUEUE']),

    queueItemExist (nftId) {
      return this.queue.some(p => p.nft_id === nftId)
    },

    maximumQuantityReached () {
      return this.queue.length >= 50
    },

    addToQueue (data, event) {
      const self = this

      if (event.shiftKey) {
        const lastAdded = this.queue.filter(c => c.market === self.data.market)

        if (lastAdded.length <= 0) { this.ADD_TO_QUEUE(data) }

        const lastItem = lastAdded[lastAdded.length - 1] || data
        const lastIndex = this.items.findIndex(c => c.nft_id === lastItem.nft_id)
        const currentIndex = this.items.findIndex(c => c.nft_id === data.nft_id)

        const start = (lastIndex > currentIndex) ? currentIndex : lastIndex + 1
        const end = (lastIndex > currentIndex) ? lastIndex : currentIndex + 1

        this.items.slice(start, end).forEach((c) => {
          if (!self.maximumQuantityReached()) {
            self.ADD_TO_QUEUE({
              nft_id: c.nft_id,
              market: c.market,
              outcome: c.outcome,
              price: c.price || 0,
              symbol: c.symbol,
              account: c.account
            })
          }
        })
      } else {
        this.ADD_TO_QUEUE(data)
      }
    },

    removeFromQueue (nftId, event) {
      const self = this

      if (event.shiftKey) {
        const lastAdded = this.queue.filter(c => c.market === self.data.market)

        // if (lastAdded.length > 0) { this.REMOVE_FROM_QUEUE(lastAdded[lastAdded.length - 1].nft_id) }

        const lastItem = lastAdded[lastAdded.length - 1] || { nft_id: nftId }

        const lastIndex = this.items.findIndex(c => c.nft_id === lastItem.nft_id)

        const currentIndex = this.items.findIndex(c => c.nft_id === nftId)

        const start = (lastIndex > currentIndex) ? currentIndex : lastIndex + 1
        const end = (lastIndex > currentIndex) ? lastIndex : currentIndex + 1

        this.items.slice(start, end).forEach((c) => {
          self.REMOVE_FROM_QUEUE(c.nft_id)
        })
      } else {
        this.REMOVE_FROM_QUEUE(nftId)
      }
    }
  }
}
</script>

<style>
</style>
