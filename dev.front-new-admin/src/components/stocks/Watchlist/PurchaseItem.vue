<template>
  <div
    class="flex items-center justify-between pt-4 pb-4 border-b border-gray-200 first:pt-0 last:border-b-0 last:pb-0 dark:border-gray-800"
  >
    <div
      @click="verCuotas(item.codCredito)"
      class="flex items-center justify-between w-full cursor-pointer py-5 px-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md transition-colors"
    >
      <div class="flex items-center gap-3">
       <!--  <div class="w-10 h-10">
          <img :src="item.logo" :alt="item.name" />
        </div> -->
        <div>
          <h3 class="text-base font-semibold text-gray-800 dark:text-white/90">Cod. de Credito: {{ item.codCredito }}  - - Cod. de Venta: {{ item.CodVenta }}</h3>
          <span class="block text-gray-500 text-theme-xs dark:text-gray-400">{{ item.CantCuotas }}</span>
        </div>
      </div>
      <div>
        <div>
          <h4 class="mb-1 font-medium text-right text-gray-700 text-theme-sm dark:text-gray-400">
          Fecha de compra: {{ formatDate(item.Fecha) }}
          </h4>
        </div>
        <span
          class="flex items-center justify-end gap-1 font-medium text-theme-xs"
          :class="
            item.SaldoCapital <= 0
              ? 'text-success-600 dark:text-success-500'
              : 'text-error-600 dark:text-error-500'
          "
        >
          Adeuda: ${{ Math.abs(item.SaldoCapital).toFixed(2) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
defineProps({
  item: {
    type: Object,
    required: true,
  },
})
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
const verCuotas = (codReciboPr: string) => {
  console.log('Ver cuotas del crédito:', codReciboPr);
  router.push(`/recpagprovdet/${codReciboPr}`);
}
</script>
