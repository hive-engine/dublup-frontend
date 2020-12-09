<template>
  <div class="radio-question custom-control custom-radio">
    <input
      :id="id"
      type="radio"
      :name="name"
      :checked="value === buttonValue"
      class="custom-control-input"
      @input="$emit('input', buttonValue)"
    >
    <label class="custom-control-label" :for="id">
      <p class="radio-label m-0">{{ question }}</p>
      <p class="text-muted m-0">{{ example }}</p>
    </label>
  </div>
</template>

<script>
export default {
  name: 'RadioQuestion',

  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    buttonValue: { type: String, required: true },

    question: { type: String, required: true },
    example: { type: String, required: true },
    value: { type: String, default: '' }
  }
}
</script>

<style>
</style>
