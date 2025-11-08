<template>
  <component
    :is="icon"
    :style="{ width: size + 'px', height: size + 'px' }"
    stroke="currentColor"
  />
</template>

<script setup lang="ts">
interface Props {
  icon: object;
  size: string;
}
const props = defineProps<Props>();
</script>

<style scoped></style>
