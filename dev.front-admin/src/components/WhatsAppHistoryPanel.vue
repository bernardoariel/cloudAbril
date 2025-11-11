<!-- src/components/WhatsAppHistoryPanel.vue -->
<template>
  <div class="bg-base-100 rounded-lg shadow-sm border p-4">
    <div class="flex justify-between items-center mb-3">
      <h3 class="font-semibold text-sm flex items-center gap-2">
        📱 Historial WhatsApp
        <span class="badge badge-primary badge-sm">{{ totalMensajes }}</span>
      </h3>
      <div class="flex gap-1">
        <button 
          v-if="totalMensajes > 0"
          @click="toggleExpanded" 
          class="btn btn-ghost btn-xs"
        >
          {{ expanded ? '📕' : '📖' }}
        </button>
        <button 
          v-if="totalMensajes > 0"
          @click="limpiarHistorial" 
          class="btn btn-ghost btn-xs text-error"
          title="Limpiar historial"
        >
          🗑️
        </button>
      </div>
    </div>

    <div v-if="totalMensajes === 0" class="text-gray-500 text-xs text-center py-2">
      No hay mensajes enviados
    </div>

    <div v-else class="space-y-2">
      <div class="text-xs text-gray-600">
        Hoy: {{ mensajesHoy.length }} mensajes
      </div>
      
      <div v-if="expanded" class="max-h-60 overflow-y-auto space-y-1">
        <div 
          v-for="mensaje in mensajesEnviados" 
          :key="mensaje.id"
          class="bg-base-200 rounded p-2 text-xs"
        >
          <div class="flex justify-between items-start gap-2">
            <div class="flex-1">
              <div class="font-semibold">{{ mensaje.nombre }}</div>
              <div class="text-gray-600">{{ mensaje.telefono }}</div>
              <div class="flex gap-2 mt-1">
                <span class="badge badge-outline badge-xs">
                  {{ mensaje.tipo === 'aviso_compra' ? 'Compra' : 'Pago' }}
                </span>
                <span class="text-gray-500">
                  {{ mensaje.cod_venta || mensaje.nro_recibo }}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-gray-500">
                {{ formatTime(mensaje.fecha_envio) }}
              </div>
              <button 
                @click="removerMensaje(mensaje.id)"
                class="btn btn-ghost btn-xs text-error mt-1"
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="text-xs text-gray-600">
        Últimos: {{ mensajesEnviados.slice(-3).map(m => m.nombre).join(', ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWhatsAppHistory } from '@/composables/useWhatsAppHistory'

const { mensajesEnviados, totalMensajes, mensajesHoy, limpiarHistorial, removerMensaje } = useWhatsAppHistory()

const expanded = ref(false)

const toggleExpanded = () => {
  expanded.value = !expanded.value
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
</script>