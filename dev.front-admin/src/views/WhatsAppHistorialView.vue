<template>
  <div class="container mx-auto p-4">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <WhatsAppTabs class="mb-4" />
        <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
          <h2 class="card-title">📱 Historial de Mensajes WhatsApp</h2>
          <button class="btn btn-primary btn-sm" @click="cargarDatos">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            Actualizar
          </button>
        </div>

        <!-- Filtros -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Filtro por tipo -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Tipo de mensaje</span>
            </label>
            <select v-model="filtroTipo" class="select select-bordered w-full" @change="aplicarFiltros">
              <option value="">Todos</option>
              <option value="aviso_compra">🛒 Aviso de Compra</option>
              <option value="aviso_pago">💰 Aviso de Pago</option>
              <!-- <option value="reclamo_pago">⚠️ Reclamo de Pago</option> -->
            </select>
          </div>

          <!-- Filtro por nombre -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Buscar por nombre</span>
            </label>
            <input
              type="text"
              v-model="filtroNombre"
              placeholder="Nombre del cliente..."
              class="input input-bordered w-full"
              @input="aplicarFiltrosLocal"
            />
          </div>

          <!-- Filtro por fecha -->
          <!-- <div class="form-control">
            <label class="label">
              <span class="label-text">Fecha de envío</span>
            </label>
            <input
              type="date"
              v-model="filtroFecha"
              class="input input-bordered w-full"
              @change="aplicarFiltrosLocal"
            />
          </div> -->
        </div>

        <!-- Estadísticas -->
        <div v-if="!isLoading" class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
          <div class="stat">
            <div class="stat-title">Total Mensajes</div>
            <div class="stat-value text-primary">{{ mensajesFiltrados.length }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Ventas</div>
            <div class="stat-value text-success">{{ mensajesCompra }}</div>
          </div>
          <div class="stat">
            <div class="stat-title">Pagos</div>
            <div class="stat-value text-warning">{{ mensajesPago }}</div>
          </div>
        </div>

        <!-- Tabla -->
        <div class="overflow-x-auto">
          <div v-if="isLoading" class="text-center p-8">
            <span class="loading loading-lg loading-spinner text-primary"></span>
            <p class="mt-2">Cargando historial...</p>
          </div>
          <div v-else-if="error" class="alert alert-error">
            <span>❌ Error: {{ error }}</span>
          </div>
          <div v-else-if="mensajesFiltrados.length === 0" class="text-center p-8">
            <p class="text-lg">No se encontraron mensajes</p>
            <p class="text-sm text-gray-500">Intenta ajustar los filtros o envía algunos mensajes primero</p>
          </div>
          <table v-else class="table table-zebra w-full">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Referencia</th>
                <th>Fecha Envío</th>
                <th>Estado</th>
                <!-- <th>Acciones</th> -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="mensaje in mensajesPaginados" :key="mensaje.id">
                <td>
                  <span class="badge" :class="getBadgeClass(mensaje.tipo)">
                    {{ getTipoLabel(mensaje.tipo) }}
                  </span>
                </td>
                <td class="font-semibold">{{ mensaje.nombre }}</td>
                <td>
                  <a :href="`https://wa.me/${mensaje.telefono}`" target="_blank" class="link link-primary">
                    {{ formatTelefono(mensaje.telefono) }}
                  </a>
                </td>
                <td>
                  <span class="text-xs">
                    {{ mensaje.source_system }}: {{ mensaje.source_id }}
                  </span>
                </td>
                <td>{{ formatFecha(mensaje.fecha_envio) }}</td>
                <td>
                  <button 
                    class="btn btn-xs btn-ghost"
                    @click="verDetalle(mensaje)"
                  >
                    👁️ Ver
                  </button>
                </td>
                <!-- <td>
                  <button 
                    class="btn btn-xs btn-success"
                    @click="reenviarMensaje(mensaje)"
                    :disabled="enviandoId === mensaje.id"
                  >
                    <span v-if="enviandoId === mensaje.id" class="loading loading-spinner loading-xs"></span>
                    <span v-else>🔄 Reenviar</span>
                  </button>
                </td> -->
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div v-if="mensajesFiltrados.length > 0" class="flex justify-center mt-4">
          <div class="join">
            <button 
              class="join-item btn btn-sm"
              :disabled="paginaActual === 1"
              @click="paginaActual--"
            >
              «
            </button>
            <button class="join-item btn btn-sm">
              Página {{ paginaActual }} de {{ totalPaginas }}
            </button>
            <button 
              class="join-item btn btn-sm"
              :disabled="paginaActual === totalPaginas"
              @click="paginaActual++"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para ver detalle -->
  <dialog id="detalleModal" class="modal" :open="modalDetalleOpen">
    <form method="dialog" class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">📋 Detalle del Mensaje</h3>
      
      <div v-if="mensajeSeleccionado" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-sm font-semibold text-gray-600">Tipo:</p>
            <p class="badge" :class="getBadgeClass(mensajeSeleccionado.tipo)">
              {{ getTipoLabel(mensajeSeleccionado.tipo) }}
            </p>
          </div>
          <div>
            <p class="text-sm font-semibold text-gray-600">Fecha:</p>
            <p>{{ formatFecha(mensajeSeleccionado.fecha_envio) }}</p>
          </div>
        </div>

        <div class="divider"></div>

        <div>
          <p class="text-sm font-semibold text-gray-600">Cliente:</p>
          <p class="text-lg">{{ mensajeSeleccionado.nombre }}</p>
        </div>

        <div>
          <p class="text-sm font-semibold text-gray-600">Teléfono:</p>
          <p>
            <a :href="`https://wa.me/${mensajeSeleccionado.telefono}`" target="_blank" class="link link-primary">
              {{ formatTelefono(mensajeSeleccionado.telefono) }}
            </a>
          </p>
        </div>

        <div>
          <p class="text-sm font-semibold text-gray-600">Referencia:</p>
          <p>{{ mensajeSeleccionado.source_system }}: {{ mensajeSeleccionado.source_id }}</p>
        </div>

        <div v-if="mensajeSeleccionado.response" class="mt-4">
          <p class="text-sm font-semibold text-gray-600 mb-2">Respuesta del servidor:</p>
          <div class="bg-base-200 p-3 rounded text-xs overflow-auto max-h-60">
            <pre>{{ JSON.stringify(mensajeSeleccionado.response, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn" @click="cerrarDetalle">Cerrar</button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import WhatsAppTabs from '@/components/WhatsAppTabs.vue'
import { useWhatsAppHistory } from '@/composables/useWhatsAppHistory'
import type { WhatsAppMessage } from '@/composables/useWhatsAppHistory'
import { whatsappService } from '@/services/whatsappService'
import { normalizePhone } from '@/common/helpers/normalizePhone'

const { mensajesEnviados, cargarHistorial, agregarMensaje } = useWhatsAppHistory()

const isLoading = ref(false)
const error = ref('')
const filtroTipo = ref<string>('')
const filtroNombre = ref('')
const filtroFecha = ref('')
const paginaActual = ref(1)
const itemsPorPagina = 20
const modalDetalleOpen = ref(false)
const mensajeSeleccionado = ref<WhatsAppMessage | null>(null)
const enviandoId = ref<string | null>(null)

// Cargar datos inicial
onMounted(() => {
  cargarDatos()
})

const cargarDatos = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const filtros: any = {}
    if (filtroTipo.value) filtros.tipo = filtroTipo.value
    await cargarHistorial(filtros)
  } catch (e: any) {
    error.value = e?.message || 'Error al cargar historial'
  } finally {
    isLoading.value = false
  }
}

const aplicarFiltros = () => {
  paginaActual.value = 1
  cargarDatos()
}

const aplicarFiltrosLocal = () => {
  paginaActual.value = 1
}

// Filtrado local por nombre y fecha
const mensajesFiltrados = computed(() => {
  let resultado = [...mensajesEnviados.value]

  // Filtrar por nombre
  if (filtroNombre.value) {
    const nombreBusqueda = filtroNombre.value.toLowerCase()
    resultado = resultado.filter(m => 
      m.nombre.toLowerCase().includes(nombreBusqueda)
    )
  }

  // Filtrar por fecha
  if (filtroFecha.value) {
    const fechaBusqueda = new Date(filtroFecha.value).toDateString()
    resultado = resultado.filter(m => 
      new Date(m.fecha_envio).toDateString() === fechaBusqueda
    )
  }

  // Ordenar por fecha descendente (más recientes primero)
  resultado.sort((a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime())

  return resultado
})

// Paginación
const totalPaginas = computed(() => Math.ceil(mensajesFiltrados.value.length / itemsPorPagina))
const mensajesPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * itemsPorPagina
  return mensajesFiltrados.value.slice(inicio, inicio + itemsPorPagina)
})

// Estadísticas
const mensajesCompra = computed(() => 
  mensajesFiltrados.value.filter(m => m.tipo === 'aviso_compra').length
)
const mensajesPago = computed(() => 
  mensajesFiltrados.value.filter(m => m.tipo === 'aviso_pago').length
)

// Helpers de formato
const getTipoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    aviso_compra: '🛒 Compra',
    aviso_pago: '💰 Pago',
    reclamo_pago: '⚠️ Reclamo'
  }
  return labels[tipo] || tipo
}

const getBadgeClass = (tipo: string) => {
  const classes: Record<string, string> = {
    aviso_compra: 'badge-success',
    aviso_pago: 'badge-warning',
    reclamo_pago: 'badge-error'
  }
  return classes[tipo] || 'badge-ghost'
}

const formatTelefono = (tel: string) => {
  if (!tel) return '-'
  // Formato: +54 9 11 1234-5678
  if (tel.length >= 12) {
    return `+${tel.slice(0, 2)} ${tel.slice(2, 3)} ${tel.slice(3, 5)} ${tel.slice(5, 9)}-${tel.slice(9)}`
  }
  return tel
}

const formatFecha = (fecha: Date | string) => {
  const d = new Date(fecha)
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Ver detalle
const verDetalle = (mensaje: WhatsAppMessage) => {
  mensajeSeleccionado.value = mensaje
  modalDetalleOpen.value = true
}

const cerrarDetalle = () => {
  modalDetalleOpen.value = false
  mensajeSeleccionado.value = null
}

// Reenviar mensaje
const reenviarMensaje = async (mensaje: WhatsAppMessage) => {
  if (!confirm(`¿Deseas reenviar el mensaje a ${mensaje.nombre}?`)) return

  enviandoId.value = mensaje.id
  try {
    let response

    if (mensaje.tipo === 'aviso_compra') {
      // Reenviar mensaje de compra
      response = await whatsappService.sendAvisoCompra({
        to: mensaje.telefono,
        nombre: mensaje.nombre,
        cod_venta: mensaje.source_id,
        fecha_compra: formatFecha(mensaje.fecha_envio),
        documento: '',
        product_list: '-',
        pago_list: '-'
      })
    } else if (mensaje.tipo === 'aviso_pago') {
      // Reenviar mensaje de pago
      response = await whatsappService.sendAvisoPago({
        to: mensaje.telefono,
        nombre: mensaje.nombre,
        nro_operacion: '',
        nro_recibo: mensaje.source_id,
        fecha: formatFecha(mensaje.fecha_envio),
        documento: '',
        nombre_sucursal: 'SUCURSAL',
        importe: '-'
      })
    }

    // Guardar en historial
    await agregarMensaje({
      tipo: mensaje.tipo,
      sourceSystem: mensaje.source_system,
      sourceId: mensaje.source_id,
      externalClientId: mensaje.source_id,
      telefono: mensaje.telefono,
      nombre: mensaje.nombre,
      response: response
    })

    alert('✅ Mensaje reenviado correctamente')
    await cargarDatos()
  } catch (e: any) {
    alert(`❌ Error al reenviar: ${e?.message || 'desconocido'}`)
  } finally {
    enviandoId.value = null
  }
}
</script>

<style scoped>
.table th {
  position: sticky;
  top: 0;
  background-color: hsl(var(--b2));
  z-index: 10;
}
</style>
