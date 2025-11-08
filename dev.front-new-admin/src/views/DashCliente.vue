<template>
  <admin-layout>
    <div class="grid grid-cols-12 gap-4 md:gap-6">

      <div class="col-span-12">
        <PurchaseHistoryItem v-if="items.length" :items="items" />
        <div v-else-if="isLoading" class="text-gray-500">Cargando créditos...</div>
        <div v-else class="text-red-500">Sin datos de crédito.</div>
      </div>

    </div>
  </admin-layout>
</template>

<script setup lang="ts">
import { computed } from  'vue'
import AdminLayout from '../components/layout/AdminLayout.vue'
import PurchaseHistoryItem from '../components/stocks/Watchlist/PurchaseHistoryItem.vue'

import { useClienteCredito } from '@/composables/useClienteCredito'


// ⚠️ por ahora lo hardcodeamos, después podés pasarlo dinámico
const codCliente = '306561'

// composable
const { clienteCredito, isLoading } = useClienteCredito(codCliente)

const items = computed(() => {
  const arr = clienteCredito.value ?? []
  return arr.slice(0, 10).map(c => {
    const monto = Number(c.MontoCapital ?? 0)


    return {
      codCredito: String(c.CodCredito),
      CantCuotas: `• ${c.CantCuotas} cuotas`,
      logo: '/images/brand/brand-07.svg',
      MontoCapital: `${monto.toLocaleString('es-AR')}`,
      // OJO: tu WatchlistItem parece tratar "change" como %.
      // Si no tenés % real, mandá 0 o calculá: (saldo/monto)*100
      SaldoCapital: c.SaldoCapital,
      CodVenta: c.CodVenta,
      Fecha: c.Fecha,
      codReciboPr:c.codReciboPr
    }
  })
})

</script>
