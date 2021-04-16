<template>
  <div class="resolution-rules">
    <ul v-for="(rule, i) of resolutionRules" :key="i" class="list-unstyled">
      <li class="bg-light p-3">
        {{ rule }}
      </li>
    </ul>
  </div>
</template>

<script>
import rules from '@/assets/data/resolution-rules.json'

export default {
  name: 'ResolutionRules',

  props: {
    template: { type: String, required: false, default: '' },
    rules: { type: Array, required: false, default: () => [] }
  },

  computed: {
    resolutionRules () {
      return this.template === 'custom' ? this.rules : rules[this.template]
    }
  }
}
</script>

<style>
</style>
