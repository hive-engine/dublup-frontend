<template>
  <footer class="footer">
    <div class="container">
      <ul class="list-inline text-center mb-3">
        <li class="list-inline-item">
          <nuxt-link :to="{name:'faq'}">
            FAQ
          </nuxt-link>
        </li>
        <li class="list-inline-item">
          <nuxt-link :to="{name:'tos'}">
            TOS
          </nuxt-link>
        </li>
      </ul>
      &copy; dublup.io
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer'
}
</script>

<style>
</style>
