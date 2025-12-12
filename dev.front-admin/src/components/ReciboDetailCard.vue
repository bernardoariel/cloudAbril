<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      
   
         

      <!-- Vista Previa WhatsApp -->
      <div v-if="recibo" class="mt-6">
        <!-- <label class="label">
          <span class="label-text font-semibold">Vista Previa WhatsApp</span>
        </label> -->
        <div class="mockup-phone">
          <div class="camera"></div>
          <div class="display">
            <div class="artboard artboard-demo phone-1 bg-green-50">
              <!-- WhatsApp Header Mockup -->
              <div class="bg-green-600 text-white p-3 rounded-t-lg">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div class="font-semibold text-sm">{{ recibo.Telefonos || 'Cliente' }}</div>
                    <div class="text-xs opacity-80">en línea</div>
                  </div>
                </div>
              </div>
              <!-- Message Bubble -->
              <div class="p-3 bg-white">
                <div class="chat chat-end">
                  <div class="chat-bubble bg-green-500 text-white text-sm max-w-xs">
                    {{ mensajeRecibo }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
   <!--  <div v-else class="text-center p-8 text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p>Selecciona un recibo para ver sus detalles</p>
    </div> -->
  </div>
</template>

<style scoped>
.mockup-phone .display .artboard {
  background: #f0fdf4;
}

.chat-bubble {
  position: relative;
  padding: 0.75rem;
  border-radius: 1rem;
  max-width: 200px;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.chat-end .chat-bubble {
  background-color: #22c55e;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.mockup-phone .camera {
  background: #1f2937;
}
</style>

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

// Computed para generar mensaje de WhatsApp del recibo
const mensajeRecibo = computed(() => {
  if (!props.recibo) return '';
  
  const sucursal = findSucursalById(props.recibo.CodSucursal || props.recibo.codSucRecibo || props.recibo.CodSucRecibo);
  const nombreSucursal = sucursal ? sucursal.NombreSuc : 'SUCURSAL NO ENCONTRADA';
  
  return `Hola ${props.recibo.NombreCont || 'CLIENTE'}, su cuenta registra un Nuevo Pago.
Documento: ${props.recibo.NroDoc || 'N/A'}
Sucursal: ${nombreSucursal}
Operación Nº: ${props.recibo.CodCredito || 'N/A'}
Importe $: ${formatCurrency(props.recibo.MontoPagado)}
Recibo Nº: ${props.recibo.CodReciboPr || 'N/A'}
Fecha: ${formatDate(props.recibo.Fecha)}
Recuerde que su crédito también puede abonarlo online y desde su hogar a través de Mercado Pago.
Gracias por cumplir con la Empresa!`;
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