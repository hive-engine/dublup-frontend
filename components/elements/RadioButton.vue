<template>
  <div class="radio-button">
    <input
      :id="id"
      type="radio"
      :name="name"
      :checked="value === buttonValue"
      @input="$emit('input', buttonValue)"
    >
    <label :for="id">
      <v-icon :name="icon" /><br>
      <p class="radio-label">{{ label }}</p>
      <p class="text-muted">{{ description }}</p>
    </label>
  </div>
</template>

<script>
export default {
  name: 'RadioButton',

  props: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    buttonValue: { type: String, required: true },

    icon: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String, required: false, default: '' },
    value: { type: String, default: '' }
  }
}
</script>

<style>
</style>
