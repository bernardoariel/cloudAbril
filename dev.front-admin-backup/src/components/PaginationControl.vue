<script setup lang="ts">
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  recordsInfo: string;
}>();

const emit = defineEmits<{
  (e: 'page-changed', page: number): void;
}>();

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('page-changed', page);
  }
};
</script>

<template>
  <div class="flex justify-between items-center mt-4" v-if="totalPages > 0">
    <div class="text-sm text-gray-500">
      {{ recordsInfo }}
    </div>
    <div class="join" v-if="totalPages > 1">
      <button class="join-item btn" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">«</button>
      <button class="join-item btn">Página {{ currentPage }} de {{ totalPages }}</button>
      <button class="join-item btn" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">»</button>
    </div>
  </div>
</template> 