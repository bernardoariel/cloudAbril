// src/composables/useWhatsAppHistory.ts

import backendApi from '@/api/abrilbackend'
import { ref, computed } from 'vue'

export interface WhatsAppMessage {
  id: string
  tipo: 'aviso_compra' | 'aviso_pago'
  telefono: string
  nombre: string
  cod_venta?: string
  nro_recibo?: string
  fecha_envio: Date
  response: any
}

const mensajesEnviados = ref<WhatsAppMessage[]>([])

export const useWhatsAppHistory =()=>{
  
  // Agregar un mensaje al historial
  const agregarMensaje = (mensaje: Omit<WhatsAppMessage, 'id' | 'fecha_envio'>) => {
    const nuevoMensaje: WhatsAppMessage = {
      ...mensaje,
      id: `${mensaje.tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fecha_envio: new Date()
    }
    mensajesEnviados.value.push(nuevoMensaje)
    // console.log('📱 Mensaje agregado al historial:', nuevoMensaje)
    backendApi.post('/whatsapp-history', {
      "tipo": "aviso_pago",
      "telefono": "37940091122",
      "nombre": "Lucía Gaamez",
      "nro_recibo": "R-9922",
      "message_status": "pending"
    });
  }

  // Verificar si ya se envió un mensaje a un telefono/codigo específico
  const yaFueEnviado = (tipo: 'aviso_compra' | 'aviso_pago', telefono: string, codigo: string): WhatsAppMessage | null => {
    return mensajesEnviados.value.find(m => 
      m.tipo === tipo && 
      m.telefono === telefono && 
      (m.cod_venta === codigo || m.nro_recibo === codigo)
    ) || null
  }

  // Obtener mensajes por tipo
  const mensajesPorTipo = (tipo: 'aviso_compra' | 'aviso_pago') => {
    return computed(() => mensajesEnviados.value.filter(m => m.tipo === tipo))
  }

  // Obtener total de mensajes enviados
  const totalMensajes = computed(() => mensajesEnviados.value.length)

  // Obtener mensajes de hoy
  const mensajesHoy = computed(() => {
    const hoy = new Date().toDateString()
    return mensajesEnviados.value.filter(m => m.fecha_envio.toDateString() === hoy)
  })

  // Limpiar historial (para desarrollo)
  const limpiarHistorial = () => {
    mensajesEnviados.value = []
    console.log('🗑️ Historial de WhatsApp limpiado')
  }

  // Remover un mensaje específico
  const removerMensaje = (id: string) => {
    const index = mensajesEnviados.value.findIndex(m => m.id === id)
    if (index !== -1) {
      mensajesEnviados.value.splice(index, 1)
      console.log(`🗑️ Mensaje ${id} removido del historial`)
    }
  }

  return {
    mensajesEnviados: computed(() => mensajesEnviados.value),
    totalMensajes,
    mensajesHoy,
    agregarMensaje,
    yaFueEnviado,
    mensajesPorTipo,
    limpiarHistorial,
    removerMensaje
  }
}