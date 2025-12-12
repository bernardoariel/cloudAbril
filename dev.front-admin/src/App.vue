<script setup lang="ts">
import { RouterView } from 'vue-router';
import NavHeader from './components/NavHeader.vue';
import FooterComponent from './components/FooterComponent.vue';
import { VueQueryDevtools } from '@tanstack/vue-query-devtools';
import { useTheme } from './composables/useTheme';

// Initialize theme service on application startup
// Note: useTheme() already calls initializeTheme() internally, no need to call it again
useTheme();
</script>

<template>
  <div id="app" class="min-h-screen bg-base-100 text-base-content">
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
