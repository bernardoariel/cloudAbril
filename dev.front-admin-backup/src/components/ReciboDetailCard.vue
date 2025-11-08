<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Detalle del Recibo</h2>
      
      <div v-if="recibo" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">
              <span class="label-text font-semibold">Código Recibo:</span>
            </label>
            <p class="text-sm">{{ recibo.CodReciboPr }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Código Crédito:</span>
            </label>
            <p class="text-sm">{{ recibo.CodCredito }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Fecha:</span>
            </label>
            <p class="text-sm">{{ formatDate(recibo.Fecha) }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Monto Pagado:</span>
            </label>
            <p class="text-sm font-bold text-primary">{{ formatCurrency(recibo.MontoPagado) }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Estado:</span>
            </label>
            <p class="text-sm">{{ recibo.Estado }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Forma de Pago:</span>
            </label>
            <p class="text-sm">{{ recibo.CodForPago }}</p>
          </div>
          
          <div>
            <label class="label">
              <span class="label-text font-semibold">Nombre Cliente:</span>
            </label>
            <p class="text-sm">{{ recibo.NombreCont }} {{ recibo.ApellidoCont }}</p>
          </div>
          <div>
            <label class="label">
              <span class="label-text font-semibold">Teléfonos:</span>
            </label>
            <p class="text-sm">{{ recibo.Telefonos }}</p>
          </div>
        </div>
      </div>
      
      <div v-else class="text-center p-8 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>Selecciona un recibo para ver sus detalles</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recibo } from '../interfaces/Recibo';

const props = defineProps<{
  recibo: any; // Aceptar cualquier forma de objeto
}>();

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { 
    timeZone: 'UTC', 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  });
};

const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return `$${amount.toLocaleString('es-AR')}`;
};
</script> 