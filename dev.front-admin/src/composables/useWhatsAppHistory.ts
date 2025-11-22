// src/composables/useWhatsAppHistory.ts

import backendApi from '@/api/abrilbackend'
import { ref, computed } from 'vue'

export interface WhatsAppMessage {
  id: string
  tipo: 'aviso_compra' | 'aviso_pago' | 'reclamo_pago'
  telefono: string
  nombre: string
  source_system: string // 'VENTA' | 'PAGO'
  source_id: string // CodVenta o NroRecibo
  fecha_envio: Date
  response?: any
}

const mensajesEnviados = ref<WhatsAppMessage[]>([])

export const useWhatsAppHistory =()=>{
  
  // Agregar un mensaje al historial (guardar en BD)
  const agregarMensaje = async (params: {
    tipo: 'aviso_compra' | 'aviso_pago' | 'reclamo_pago'
    sourceSystem: string // 'VENTA' | 'PAGO'
    sourceId: string // CodVenta o NroRecibo
    externalClientId: string // IdCliente o DNI
    nombre: string
    telefono: string
    payloadSnapshot?: any // opcional: datos del detalle (productos, montos, etc)
    response?: any // respuesta del proveedor WhatsApp
  }) => {
    try {
      const response = await backendApi.post('/whatsapp-history/messages', {
        tipo: params.tipo,
        sourceSystem: params.sourceSystem,
        sourceId: params.sourceId,
        externalClientId: params.externalClientId,
        nombre: params.nombre,
        telefono: params.telefono,
        payloadSnapshot: params.payloadSnapshot
      })

      // Agregar a la lista en memoria para UI
      const nuevoMensaje: WhatsAppMessage = {
        id: response.data?.data?.id || `${params.tipo}_${Date.now()}`,
        tipo: params.tipo,
        telefono: params.telefono,
        nombre: params.nombre,
        source_system: params.sourceSystem,
        source_id: params.sourceId,
        fecha_envio: new Date(),
        response: params.response
      }
      mensajesEnviados.value.push(nuevoMensaje)
      
      console.log('✅ Mensaje guardado en BD:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error al guardar mensaje:', error)
      throw error
    }
  }

  // Cargar mensajes del historial desde el backend
  const cargarHistorial = async (filtros?: {
    tipo?: 'aviso_compra' | 'aviso_pago' | 'reclamo_pago'
    externalClientId?: string
    sourceId?: string
    status?: string
  }) => {
    try {
      const params = new URLSearchParams()
      if (filtros?.tipo) params.append('tipo', filtros.tipo)
      if (filtros?.externalClientId) params.append('externalClientId', filtros.externalClientId)
      if (filtros?.sourceId) params.append('sourceId', filtros.sourceId)
      if (filtros?.status) params.append('status', filtros.status)

      const response = await backendApi.get(`/whatsapp-history/messages?${params.toString()}`)
      
      // Mapear los datos del backend al formato local
      if (response.data?.items) {
        mensajesEnviados.value = response.data.items.map((item: any) => ({
          id: item.id,
          tipo: item.tipo,
          telefono: item.telefono,
          nombre: item.nombre,
          source_system: item.source_system,
          source_id: item.source_id,
          fecha_envio: new Date(item.created_at),
          response: item.response ? JSON.parse(item.response) : null
        }))
      }
      
      console.log('✅ Historial cargado:', mensajesEnviados.value.length, 'mensajes')
      return mensajesEnviados.value
    } catch (error: any) {
      console.error('❌ Error al cargar historial:', error)
      throw error
    }
  }

  // Obtener mensajes por tipo
  const mensajesPorTipo = (tipo: 'aviso_compra' | 'aviso_pago' | 'reclamo_pago') => {
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
    cargarHistorial,
    mensajesPorTipo,
    limpiarHistorial,
    removerMensaje
  }
}