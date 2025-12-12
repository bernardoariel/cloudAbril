<template>
  <div class="app-container bg-base-200 min-h-screen flex flex-col">
    <NavHeader />
    <div class="flex-grow bg-base-100">
      <RouterView />
    </div>
    <FooterComponent />
  </div>
</template>

<script setup lang="ts">
import NavHeader from '@/components/NavHeader.vue';
import FooterComponent from '@/components/FooterComponent.vue';
import { RouterView } from 'vue-router';
</script>

<style scoped>
.app-container {
  max-width: 100%;
  overflow-x: hidden;
  padding: 0;
  margin: 0 auto;
}
.flex-grow {
  width: 100%;
  height: calc(100vh - 128px);
}
</style>
