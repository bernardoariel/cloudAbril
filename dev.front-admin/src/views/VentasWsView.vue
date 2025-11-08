<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Columna de la Tabla (ocupa 2 de 3 columnas en LG) -->
      <div class="lg:col-span-2 card bg-base-100 shadow-xl">
        <div class="card-body">
          <WhatsAppTabs class="mb-4" />
          <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 class="card-title">Lista de Ventas</h2>
            <div class="flex items-center gap-2">
              <!-- Dropdown de Filtros de Teléfono y Sucursal -->
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-outline">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Filtros
                </label>
                <div
                  tabindex="0"
                  class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-2 z-50"
                >
                  <div class="p-2 font-bold">Filtrar por Teléfono</div>
                  <label class="label cursor-pointer">
                    <span class="label-text">Solo teléfonos válidos</span>
                    <input
                      type="checkbox"
                      v-model="filterValidPhones"
                      class="checkbox checkbox-primary"
                    />
                  </label>
                  <label class="label cursor-pointer">
                    <span class="label-text">Solo teléfonos inválidos</span>
                    <input
                      type="checkbox"
                      v-model="filterInvalidPhones"
                      class="checkbox checkbox-primary"
                    />
                  </label>
                  <div class="divider my-1"></div>
                  <!-- Acordeón filtro sucursal -->
                  <div
                    class="flex items-center justify-between p-2 font-bold cursor-pointer select-none"
                    @click="toggleSucursalesFiltro"
                  >
                    <span>Filtrar por Sucursal</span>
                    <span>
                      <svg
                        v-if="!mostrarSucursalesFiltro"
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 12H4"
                        />
                      </svg>
                    </span>
                  </div>
                  <transition name="fade">
                    <div v-if="mostrarSucursalesFiltro">
                      <input
                        type="text"
                        v-model="textoBusquedaSucursal"
                        placeholder="Buscar sucursal..."
                        class="input input-bordered input-sm w-full mb-2"
                      />
                      <label class="label cursor-pointer">
                        <span class="label-text font-semibold">Todas las sucursales</span>
                        <input
                          type="checkbox"
                          class="checkbox checkbox-primary"
                          :checked="todasSeleccionadas"
                          @change="toggleTodasSucursales"
                        />
                      </label>
                      <div class="max-h-40 overflow-y-auto">
                        <label
                          v-for="sucursal in sucursalesFiltradas"
                          :key="sucursal.CodSucursal"
                          class="label cursor-pointer"
                        >
                          <span class="label-text">{{ sucursal.NombreSuc }}</span>
                          <input
                            type="checkbox"
                            class="checkbox checkbox-primary"
                            :value="sucursal.CodSucursal"
                            v-model="sucursalesSeleccionadas"
                          />
                        </label>
                      </div>
                    </div>
                  </transition>
                </div>
              </div>
              <DateRangeFilter @filter-applied="handleFilterUpdate" />
              <!-- Botón Enviar WhatsApp -->
              <button class="btn btn-success" @click="openWhatsModal">
                Enviar WhatsApp
              </button>
            </div>
          </div>

          <div
            v-if="activeFilterLabel || selectedKeys.size > 0"
            class="flex justify-between items-center p-3 bg-base-200 rounded-lg text-sm mb-4"
          >
            <span v-if="activeFilterLabel"
              >Filtro: <span class="font-bold">{{ activeFilterLabel }}</span></span
            >
            <span v-if="seleccionablesSeleccionados > 0" class="font-bold"
              >{{ seleccionablesSeleccionados }} registros seleccionados</span
            >
          </div>

          <div class="overflow-x-auto">
            <div v-if="isLoading" class="text-center p-4">
              <span class="loading loading-lg loading-spinner text-primary"></span>
              <p>Cargando ventas...</p>
            </div>
            <div v-else-if="error" class="alert alert-error">
              <span>Error! Ha ocurrido un problema: {{ error }}</span>
            </div>
            <div v-else-if="paginatedVentasSucursal.length > 0">
              <DataTable
                :data="paginatedVentasSucursal"
                :columns="columns"
                row-key="venta_CodVenta"
                :selected-row-key="selectedVentaKey"
                :selected-keys="selectedKeys"
                :is-all-selected="isAllSelected"
                @row-clicked="handleRowClick"
                @toggle-row-selection="toggleRowSelection"
                @set-select-all="setSelectAll"
              />
              <PaginationControl
                :current-page="currentPage"
                :total-pages="totalPagesSucursal"
                :records-info="recordsInfoSucursal"
                @page-changed="setPage"
              />
            </div>
            <div v-else class="text-center p-4">
              <p>No se encontraron registros que coincidan con los filtros aplicados.</p>
            </div>
          </div>
        </div>
      </div>
      <!-- Columna del Detalle (ocupa 1 de 3 columnas en LG) -->
      <div class="lg:col-span-1">
        <VentaDetailCard
          :venta="selectedVenta"
          :detalleFactura="detalle"
          :loadingDetalle="loadingDetalle"
          :errorDetalle="errorDetalle"
          :metodosPago="metodosPago"
        />
      </div>
    </div>
  </div>

  <!-- Modal DaisyUI -->
  <dialog id="whatsModal" class="modal" :open="isWhatsModalOpen">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-2">Enviar WhatsApp</h3>

      <!-- Mensaje de estado -->
      <div
        v-if="whatsAppMessage"
        class="alert mb-4"
        :class="whatsAppMessage.includes('Error') ? 'alert-error' : 'alert-success'"
      >
        <span>{{ whatsAppMessage }}</span>
      </div>

      <div class="mb-4">
        <div class="font-semibold">Información del envío:</div>
        <div class="bg-base-200 p-3 rounded text-sm">
          <p>
            <strong>Registros seleccionados:</strong> {{ seleccionablesSeleccionados }}
          </p>
          <p><strong>Se enviará al primer registro con teléfono válido</strong></p>
          <p class="text-xs text-gray-600 mt-2">
            Template: aviso_compra<br />
            Endpoint: http://localhost:3010/whatsapp/template/aviso_compra_abril
          </p>
        </div>
      </div>

      <div class="modal-action">
        <button
          class="btn btn-outline"
          @click="closeWhatsModal"
          type="button"
          :disabled="isSendingWhatsApp"
        >
          Cancelar
        </button>
        <button
          class="btn btn-success"
          type="button"
          @click="sendWhatsApp"
          :disabled="isSendingWhatsApp || seleccionablesSeleccionados === 0"
        >
          <span
            v-if="isSendingWhatsApp"
            class="loading loading-spinner loading-sm"
          ></span>
          {{
            isSendingWhatsApp
              ? "Enviando..."
              : `Enviar WhatsApp (${seleccionablesSeleccionados})`
          }}
        </button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import DateRangeFilter from "@/components/DateRangeFilter.vue";
import DataTable from "@/components/DataTable.vue";
import PaginationControl from "@/components/PaginationControl.vue";
import VentaDetailCard from "@/components/VentaDetailCard.vue";
import WhatsAppTabs from "@/components/WhatsAppTabs.vue";
import { useVentas } from "../composables/useVentas";
import type { Venta } from "../interfaces/Venta";
import { useDetalleFactura } from "@/composables/useDetalleFactura";
import { useSucursales } from "@/modules/sqlserver/sucursales/composable/useSucursales";
import { whatsappService } from '../services/whatsappService';



const {
  isLoading,
  error,
  columns,
  paginatedData,
  currentPage,
  totalPages,
  recordsInfo,
  filterValidPhones,
  filterInvalidPhones,
  selectedKeys,
  isAllSelected,
  setDateRange,
  setPhoneFilters,
  setPage,
  toggleRowSelection,
  setSelectAll,
  filteredVentas,
} = useVentas();

const {
  detalle,
  loading: loadingDetalle,
  error: errorDetalle,
  fetchDetalle,
  metodosPago,
} = useDetalleFactura();

const { sucursales, isLoading: loadingSucursales } = useSucursales();
const sucursalesSeleccionadas = ref<number[]>([]);

// Buscador de sucursales
const textoBusquedaSucursal = ref("");
const sucursalesFiltradas = computed(() => {
  if (!textoBusquedaSucursal.value) return sucursales.value;
  return sucursales.value.filter((s) =>
    s.NombreSuc.toLowerCase().includes(textoBusquedaSucursal.value.toLowerCase())
  );
});

// Estado para expandir/cerrar filtro de sucursal
const mostrarSucursalesFiltro = ref(false);
const toggleSucursalesFiltro = () => {
  mostrarSucursalesFiltro.value = !mostrarSucursalesFiltro.value;
};

const selectedVenta = ref<Venta | null>(null);
const selectedVentaKey = computed(() => selectedVenta.value?.venta_CodVenta || null);

const activeFilterLabel = ref("");

const handleFilterUpdate = (filter: { from: string; to: string; label: string }) => {
  activeFilterLabel.value = filter.label;
  setDateRange(filter.from, filter.to);
  selectedVenta.value = null;
};

const handleRowClick = (venta: Venta) => {
  selectedVenta.value = venta;
  if (venta?.venta_CodVenta) {
    fetchDetalle(venta.venta_CodVenta);
  }
};

// Observador para actualizar los filtros de teléfono cuando cambien en la UI
watch([filterValidPhones, filterInvalidPhones], ([valid, invalid]) => {
  setPhoneFilters(valid, invalid);
  selectedVenta.value = null;
});

// Opción para seleccionar/deseleccionar todas
const toggleTodasSucursales = () => {
  if (sucursalesSeleccionadas.value.length === sucursales.value.length) {
    sucursalesSeleccionadas.value = [];
  } else {
    sucursalesSeleccionadas.value = sucursales.value.map((s) => s.CodSucursal);
  }
};
const todasSeleccionadas = computed(
  () =>
    sucursales.value.length > 0 &&
    sucursalesSeleccionadas.value.length === sucursales.value.length
);

// Computada para filtrar por sucursales seleccionadas
const ventasFiltradasPorSucursal = computed(() => {
  if (!sucursalesSeleccionadas.value.length) return filteredVentas.value;
  return filteredVentas.value.filter((venta: any) =>
    sucursalesSeleccionadas.value.includes(venta.CodSucursal)
  );
});

// Computada para paginación sobre las ventas filtradas por sucursal
const paginatedVentasSucursal = computed(() => {
  const start = (currentPage.value - 1) * 8;
  return ventasFiltradasPorSucursal.value.slice(start, start + 8);
});

const totalPagesSucursal = computed(() =>
  Math.ceil(ventasFiltradasPorSucursal.value.length / 8)
);
const recordsInfoSucursal = computed(() => {
  const total = ventasFiltradasPorSucursal.value.length;
  if (total === 0) return "";
  const start = (currentPage.value - 1) * 8 + 1;
  const end = start + paginatedVentasSucursal.value.length - 1;
  return `Mostrando ${start} - ${end} de ${total} registros`;
});

// Computada para contar solo los seleccionados con teléfono válido
const seleccionablesSeleccionados = computed(() => {
  return ventasFiltradasPorSucursal.value.filter((item: any) => {
    const telefono = item.Telefonos;
    const digitsOnly = telefono ? telefono.replace(/\D/g, "") : "";
    const telefonoValido = digitsOnly.length >= 10;
    return telefonoValido && selectedKeys.value.has(item.venta_CodVenta);
  }).length;
});

const isWhatsModalOpen = ref(false);
const isSendingWhatsApp = ref(false);
const whatsAppMessage = ref("");

function openWhatsModal() {
  isWhatsModalOpen.value = true;
}
function closeWhatsModal() {
  isWhatsModalOpen.value = false;
}
type AvisoCompraPayload = {
  to: string;
  nombre: string;
  cod_venta: string;
  fecha_compra: string;
  documento: string;
  product_list: string;
  pago_list: string;
};
async function sendWhatsApp() {
  try {
    isSendingWhatsApp.value = true;

    // 1) Filtrar selección con teléfono válido
    const ventasSeleccionadas = ventasFiltradasPorSucursal.value.filter((item: any) => {
      const digits = (item.Telefonos ?? '').replace(/\D/g, '');
      return digits.length >= 10 && selectedKeys.value.has(item.venta_CodVenta);
    });
    if (ventasSeleccionadas.length === 0) {
      whatsAppMessage.value = 'No hay registros seleccionados con teléfonos válidos';
      return;
    }

    const v = ventasSeleccionadas[0];

    // 2) Normalizar teléfono
    let telefono = (v.Telefonos ?? '').replace(/\D/g, '');
    if (telefono.length === 10) telefono = '54' + telefono;

    // DEV: forzá número de prueba
    telefono = '543704299434';

    // 3) Datos auxiliares
    await fetchDetalle(v.venta_CodVenta);

    let productosLista = '';
    if (detalle.value?.detalles?.length) {
      const filas = detalle.value.detalles
        .filter((d: any) => d.CodProducto >= 1000)
        .map((d: any) => `${d.Cantidad} - ${d.NombreProducto}`);
      productosLista = filas.join('\n');
    }

    let metodosLista = '';
    if (metodosPago.value?.length) {
      metodosLista = metodosPago.value
        .map((m: any) => `${m.CodForPago} $${Number(m.Importe ?? 0).toLocaleString('es-AR')}`)
        .join('\n');
    }

    // 4) Armar DTO para /ws/compra (aviso_compra_abril)
    const payload: AvisoCompraPayload = {
      to: telefono,
      nombre: v.Nombre,
      cod_venta: String(v.venta_CodVenta),
      fecha_compra: new Date(v.venta_Fecha).toLocaleDateString('es-AR'),
      documento: String(v.NroDoc ?? ''),
      product_list: productosLista || '-',
      pago_list: metodosLista || '-',
    };


    // 5) Llamada a tu backend
    await whatsappService.post('/whatsapp/aviso_compra_abril', payload); // usa tu wrapper/axios

    whatsAppMessage.value = `WhatsApp enviado a ${v.Nombre} (${telefono})`;
    setTimeout(() => { closeWhatsModal(); whatsAppMessage.value = ''; }, 1500);
  } catch (err: any) {
    console.error('Error enviando WhatsApp:', err);
    const msg = err?.response?.data?.error?.message
      || err?.message
      || 'Error desconocido';
    whatsAppMessage.value = `Error enviando WhatsApp: ${msg}`;
  } finally {
    isSendingWhatsApp.value = false;
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
