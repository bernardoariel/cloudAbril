<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Detalle del Recibo</h2>
      
      <div v-if="recibo" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">
              <span class="label-text font-semibold">Recibo PRNro.:</span>
            </label>
              <p class="text-sm font-bold text-primary"><strong>{{ recibo.CodReciboPr }}</strong></p>
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
              <span class="label-text font-semibold">Sucursal:</span>
            </label>
            <div v-if="nombreSucursal" class="flex items-center gap-2">
              <p class="text-sm font-medium text-blue-600">{{ nombreSucursal }}</p>
              <span class="badge badge-outline text-xs">{{ recibo.CodSucursal || recibo.codSucRecibo || recibo.CodSucRecibo }}</span>
            </div>
            <div v-else-if="isLoading" class="flex items-center gap-2 text-blue-500">
              <div class="loading loading-spinner loading-xs"></div>
              <p class="text-sm">Cargando sucursales...</p>
            </div>
            <div v-else-if="recibo.CodSucursal || recibo.codSucRecibo || recibo.CodSucRecibo" class="text-orange-600">
              <p class="text-sm">Código: {{ recibo.CodSucursal || recibo.codSucRecibo || recibo.CodSucRecibo }}</p>
              <p class="text-xs text-gray-500">(Sucursal no encontrada)</p>
            </div>
            <p v-else class="text-sm text-gray-400">No disponible</p>
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
import { computed, watchEffect } from 'vue';
import type { Recibo } from '../interfaces/Recibo';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';

const props = defineProps<{
  recibo: any; // Aceptar cualquier forma de objeto
}>();

const { sucursales, isLoading, findSucursalById } = useSucursales();

// Debug: Mostrar campos de sucursal disponibles
watchEffect(() => {
  if (props.recibo) {
    console.log('🏢 Campos de sucursal en recibo:', {
      CodSucursal: props.recibo.CodSucursal,
      codSucRecibo: props.recibo.codSucRecibo,
      CodSucRecibo: props.recibo.CodSucRecibo,
      todosLosCampos: Object.keys(props.recibo).filter(key => 
        key.toLowerCase().includes('suc')
      ),
      sucursalesCargadas: sucursales.value.length,
      isLoading: isLoading.value
    });
  }
});

// Computed para obtener el nombre de la sucursal
const nombreSucursal = computed(() => {
  if (!props.recibo) return null;
  
  // Priorizar CodSucursal que es lo que viene del API
  const codigoSucursal = props.recibo.CodSucursal || props.recibo.codSucRecibo || props.recibo.CodSucRecibo;
  
  if (!codigoSucursal) return null;
  
  const sucursal = findSucursalById(codigoSucursal);
  
  console.log('🔍 Buscando sucursal:', {
    codigo: codigoSucursal,
    sucursalesDisponibles: sucursales.value.map(s => ({ cod: s.CodSucursal, nombre: s.NombreSuc })),
    encontrada: sucursal
  });
  
  return sucursal ? sucursal.NombreSuc : null;
});

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