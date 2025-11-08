<template>
  <div>
    <AdminLayout>
      <BreadCrumb :items="breadcrumbItems" />
      <div class="grid grid-cols-1 gap-6">
        <!-- Detalles del crédito -->
        <div class="bg-white dark:bg-gray-900/80 rounded-lg shadow-sm p-6">
          <div v-if="isLoading" class="flex justify-center items-center h-40">
            <LoadingSpinner />
          </div>
          <div v-else-if="error" class="text-error-600 dark:text-error-500 p-4">
            Error al cargar los datos: {{ error }}
          </div>
          <div v-else-if="credito === null || credito === undefined" class="text-error-600 dark:text-error-500 p-4">
            No se han podido cargar los datos del crédito. Por favor, verifica el código de crédito: {{ codReciboPr }}
          </div>
          <div v-else-if="creditoData">
            <div class="flex justify-between items-center mb-4">
              <router-link
                to="/dashcliente"
                class="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all"
                title="Ir al panel de cliente"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </router-link>

              <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                Crédito #{{ codCredito }} ({{ codReciboPr }})
              </h2>


            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Código del Recibo</h3>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ creditoData.codReciboPr || codReciboPr }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Número de Cuota</h3>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">{{ creditoData.nroCuota || creditoData.nroCuota === 0 ? creditoData.nroCuota : 'N/A' }}</p>
              </div>
              <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">Monto Cuota</h3>
                <p class="text-xl font-semibold text-gray-900 dark:text-white">${{ creditoData.montoCuo?.toFixed(2) || '0.00' }}</p>
              </div>
            </div>

            <!-- Vista simplificada para una sola cuota -->
            <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-6">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Detalle del pago</h3>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Número de cuota</p>
                  <p class="text-xl font-medium text-gray-900 dark:text-white">{{ creditoData.nroCuota || creditoData.nroCuota === 0 ? creditoData.nroCuota : 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Monto de la cuota</p>
                  <p class="text-xl font-medium text-gray-900 dark:text-white">${{ creditoData.montoCuo?.toFixed(2) || '0.00' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Intereses punitorios</p>
                  <p class="text-xl font-medium text-gray-900 dark:text-white">${{ creditoData.intPunit?.toFixed(2) || '0.00' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Total a pagar</p>
                  <p class="text-xl font-bold text-gray-900 dark:text-white">${{ getTotalAPagar().toFixed(2) }}</p>
                </div>
              </div>

              <div class="flex justify-center">
                <button
                  @click="realizarPagoSimple(creditoData)"
                  class="inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md transition-colors shadow-sm text-white bg-blue-600 hover:bg-blue-700 border border-blue-600"
                >
                  <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                  </svg>
                  Pagar  ${{ getTotalAPagar().toFixed(2) }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BreadCrumb from '@/components/ui/Breadcrumb.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { useClienteCreditoRecProvDetalle } from '@/composables/useClienteCreditoRecProvDetalle'
import axios from 'axios'
import '@/assets/css/mercado-pago.css'
import mercadoPagoService from '@/services/mercadoPago.service'
import type { ClienteCreditoRecProvDetalle } from '@/interface/ClienteCreditoRecProvDetalle'

const route = useRoute()
const codReciboPr = ref(route.params.codReciboPr as string || '')
const codCredito = ref(codReciboPr.value)
const processingCuota = ref<number | null>(null) // Tracking qué cuota está en proceso
const isDevelopment = process.env.NODE_ENV !== 'production'
const mercadoPagoPublicKey = 'APP_USR-0592010c-6b73-4480-ba4e-e058a011f9ec'

onMounted(() => {
  // Cargar el script de Mercado Pago
  const script = document.createElement('script')
  script.src = 'https://sdk.mercadopago.com/js/v2'
  script.async = true
  document.body.appendChild(script)

  script.onload = () => {
    // Inicializar Mercado Pago cuando el script está cargado
    if (window.MercadoPago) {
      const mp = new window.MercadoPago(mercadoPagoPublicKey, {
        locale: 'es-AR'
      })
      window.mp = mp
      console.log('Mercado Pago SDK inicializado correctamente');
    }
  }

  // Verificar si hay algún pago pendiente de verificar (por si el usuario regresa después de pagar)
  const checkPendingPayment = async () => {
    const transactionData = localStorage.getItem('mp_transaction_data')

    if (transactionData) {
      try {
        const { id, timestamp, codCredito: storedCodCredito, nroCuota } = JSON.parse(transactionData)

        // Solo verificar pagos recientes (menos de 30 minutos) y del mismo crédito
        const isRecent = (Date.now() - timestamp) < (30 * 60 * 1000)
        const isSameCredit = storedCodCredito === codCredito.value

        if (isRecent && isSameCredit) {
          console.log('Verificando pago pendiente:', id)

          // Verificar el estado del pago consultando al backend
          try {
            const response = await axios.get(`http://localhost:3000/api/mercado-pago/verificar-pago/${id}`)

            if (response.data && response.data.status === 'approved') {
              // Notificar al backend y actualizar la UI
              await mercadoPagoService.confirmarPago(storedCodCredito, nroCuota, id)
              alert('¡Pago verificado con éxito!')

              // Actualizar los datos del crédito para reflejar el pago
              // Si hay un método refetch disponible en el composable
              if (typeof credito.value?.refetch === 'function') {
                await credito.value.refetch()
              }
            }
          } catch (error) {
            console.error('Error al verificar pago pendiente:', error)
          } finally {
            // Limpiar el storage para no volver a verificar
            localStorage.removeItem('mp_transaction_data')
          }
        } else {
          // Si el pago es antiguo o de otro crédito, limpiar
          localStorage.removeItem('mp_transaction_data')
        }
      } catch (error) {
        console.error('Error al procesar datos de transacción guardados:', error)
        localStorage.removeItem('mp_transaction_data')
      }
    }
  }

  // Verificar pagos pendientes después de que se carga la página
  setTimeout(checkPendingPayment, 1000)

  // Registrar los datos del crédito cuando esté disponible
  setTimeout(() => {
    console.log('Estado después de timeout:')
    console.log('isLoading:', isLoading.value)
    console.log('credito:', credito.value)
    console.log('error:', error.value)
  }, 2000)
})

onUnmounted(() => {
  // Eliminar el script al desmontar el componente
  const script = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]')
  if (script) {
    document.body.removeChild(script)
  }
})

const breadcrumbItems = [
  {
    label: 'Inicio',
    href: '/',
  },
  {
    label: 'Créditos',
    href: '/creditos',
  },
  {
    label: `Crédito #${codCredito.value}`,
    href: `/creditos/${codCredito.value}`,
  },
]

// Utilizar el composable para obtener los datos del crédito
const { credito, isLoading, error } = useClienteCreditoRecProvDetalle(codReciboPr.value)

// Mostrar los valores que trae el composable en la consola de manera más detallada
console.log('==================== DEBUG INFO ====================')
console.log('codReciboPr:', codReciboPr.value)
console.log('codCredito:', codCredito.value)
console.log('isLoading:', isLoading.value)
console.log('error:', error.value)
console.log('credito recibido:', credito.value)
console.log('==================== END DEBUG ====================')

// Propiedad computada para acceder a los datos del crédito
const creditoData = computed(() => {
  if (!credito.value) return null;

  // Si es un objeto proxy con índices numéricos, tomar el primer elemento (0)
  if (typeof credito.value === 'object' && credito.value[0]) {
    console.log('Accediendo a datos indexados:', credito.value[0]);
    return credito.value[0];
  }

  // Si es un objeto normal con propiedades directas
  return credito.value;
});

// Función para calcular el total a pagar de forma segura
const getTotalAPagar = () => {
  if (!creditoData.value) return 0;

  const montoCuo = creditoData.value.montoCuo || 0;
  const intPunit = creditoData.value.intPunit || 0;

  return montoCuo + intPunit;
};

// Extender la interfaz Window para incluir MercadoPago
declare global {
  interface Window {
    MercadoPago: new (publicKey: string, options?: Record<string, unknown>) => unknown;
    mp: unknown;
  }
}

// Manejar el pago de una cuota simple (para ClienteCreditoRecProvDetalle)
const realizarPagoSimple = async (cuota: ClienteCreditoRecProvDetalle) => {
  try {
    // Establecer que estamos procesando la cuota
    processingCuota.value = cuota.nroCuota
    console.log('Iniciando pago con Mercado Pago para la cuota:', cuota.nroCuota)

    // Calcular el monto total a pagar
    const montoTotal = cuota.montoCuo + cuota.intPunit

    // Usamos preferentemente el método crearPago que incluye la información de la cuota
    let preferenceData;

    try {
      // Intentar usar el método que incluye información de la cuota
      if (codCredito.value && cuota.nroCuota !== undefined) {
        preferenceData = await mercadoPagoService.crearPago(codCredito.value, cuota.nroCuota);
        console.log('Usando método crearPago con información de cuota');
      } else {
        // Si falta información, usar el método simple
        preferenceData = await mercadoPagoService.pagoSimple(montoTotal);
        console.log('Usando método pagoSimple (sin información de cuota)');
      }
    } catch (err) {
      console.warn('Error con método preferido, intentando método alternativo:', err);
      preferenceData = await mercadoPagoService.pagoSimple(montoTotal);
    }

    if (preferenceData && preferenceData.init_point) {
      console.log('Preferencia de pago creada:', preferenceData)

      // Guardar datos de la transacción para verificación posterior
      localStorage.setItem('mp_transaction_data', JSON.stringify({
        id: preferenceData.id,
        timestamp: Date.now(),
        codCredito: codCredito.value,
        nroCuota: cuota.nroCuota,
        description: `Pago cuota ${cuota.nroCuota} - Crédito #${codCredito.value}`
      }));

      // Determinar qué URL utilizar según el entorno
      const checkoutUrl = isDevelopment
        ? preferenceData.sandbox_init_point
        : preferenceData.init_point

      // Abrir la ventana de pago
      window.open(checkoutUrl, '_blank')
    } else {
      throw new Error('No se recibió una respuesta válida del servicio de pagos')
    }
  } catch (error) {
    console.error('Error al iniciar el pago con Mercado Pago:', error)
    alert('Ha ocurrido un error al intentar procesar el pago. Por favor, intente nuevamente.')
  } finally {
    // Restablecer el estado de procesamiento
    processingCuota.value = null
  }
}
</script>
