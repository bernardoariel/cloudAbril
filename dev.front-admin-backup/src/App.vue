<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavHeader from './components/NavHeader.vue';
import FooterComponent from './components/FooterComponent.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
</script>

<template>
  <div id="app" class="bg-orange-300">
    <RouterView />
  </div>
  <VueQueryDevtools />
</template>

<style scoped>
#app {
  max-width: 100%;
  overflow-x: hidden;
  padding: 0;
  margin: 0 auto;
}
</style>
