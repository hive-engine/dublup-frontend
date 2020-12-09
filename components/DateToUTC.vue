<template>
  <span>{{ format(utcToZonedTime(datetime, 'Etc/GMT'), 'MMMM dd, yyyy hh:mm aa', { timeZone: 'Etc/GMT' }) }}</span>
</template>

<script>
import { format, utcToZonedTime } from 'date-fns-tz'

export default {
  name: 'DateToUTC',

  props: {
    datetime: { type: String, required: true }
  },

  methods: {
    format,
    utcToZonedTime
  }
}
</script>

<style>

</style>
