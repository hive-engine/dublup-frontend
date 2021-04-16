<template>
  <article class="market" :class="{'market-closed-bg': market.status ===2}">
    <b-row>
      <b-col>
        <div class="category">
          <nuxt-link :to="{name: route, query:{category: market.category}}">
            {{ market.category }}
          </nuxt-link> / <nuxt-link :to="{name: route, query:{category: market.category, sub_category: market.sub_category}}">
            {{ market.sub_category }}
          </nuxt-link>
        </div>
      </b-col>

      <b-col class="text-right">
        <span class="text-muted">Event Expiration:</span> {{ format(new Date(market.expires_at), 'MMMM dd, yyyy') }}
      </b-col>
    </b-row>

    <nuxt-link class="question" :to="{name:'market-market', params:{market: market.id}}">
      {{ market.question }}
    </nuxt-link>

    <ul class="outcomes">
      <li v-for="(outcome, o) of Object.keys(market.possible_outcomes_pct)" :key="o">
        <div class="outcome-details">
          <span>{{ outcome }}</span> <span>{{ market.possible_outcomes[outcome] }} <span class="small">({{ market.possible_outcomes_pct[outcome] }}%)</span></span>
        </div>
        <b-progress :value="market.possible_outcomes_pct[outcome]" :max="100" height="5px" />
      </li>
    </ul>
  </article>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'MarketCard',

  props: {
    market: { type: Object, required: true },
    route: { type: String, required: false, default: 'index' }
  },

  methods: {
    format
  }
}
</script>

<style>

</style>
