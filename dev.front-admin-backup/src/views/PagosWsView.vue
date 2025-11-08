<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Columna de la Tabla (ocupa 2 de 3 columnas en LG) -->
      <div class="lg:col-span-2 card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 class="card-title">Listado de Pagos</h2>
            <div class="flex items-center gap-2">
              <!-- Dropdown de Filtros de Teléfono y Sucursal -->
              <div class="dropdown dropdown-end">
                <label tabindex="0" class="btn btn-outline">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" /></svg>
                  Filtros
                </label>
                <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-2 z-50">
                  <div class="p-2 font-bold">Filtrar por Teléfono</div>
                  <label class="label cursor-pointer">
                    <span class="label-text">Solo teléfonos válidos</span> 
                    <input type="checkbox" v-model="filterValidPhones" class="checkbox checkbox-primary" />
                  </label>
                  <label class="label cursor-pointer">
                    <span class="label-text">Solo teléfonos inválidos</span> 
                    <input type="checkbox" v-model="filterInvalidPhones" class="checkbox checkbox-primary" />
                  </label>
                  <div class="divider my-1"></div>
                  <!-- Acordeón filtro sucursal -->
                  <div class="flex items-center justify-between p-2 font-bold cursor-pointer select-none" @click="toggleSucursalesFiltro">
                    <span>Filtrar por Sucursal</span>
                    <span>
                      <svg v-if="!mostrarSucursalesFiltro" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                    </span>
                  </div>
                  <transition name="fade">
                    <div v-if="mostrarSucursalesFiltro">
                      <input type="text" v-model="textoBusquedaSucursal" placeholder="Buscar sucursal..." class="input input-bordered input-sm w-full mb-2" />
                      <label class="label cursor-pointer">
                        <span class="label-text font-semibold">Todas las sucursales</span>
                        <input type="checkbox" class="checkbox checkbox-primary" :checked="todasSeleccionadas" @change="toggleTodasSucursales" />
                      </label>
                      <div class="max-h-40 overflow-y-auto">
                        <label v-for="sucursal in sucursalesFiltradas" :key="sucursal.CodSucursal" class="label cursor-pointer">
                          <span class="label-text">{{ sucursal.NombreSuc }}</span>
                          <input type="checkbox" class="checkbox checkbox-primary"
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
            </div>
          </div>

          <div v-if="activeFilterLabel || selectedKeys.size > 0" class="flex justify-between items-center p-3 bg-base-200 rounded-lg text-sm mb-4">
            <span v-if="activeFilterLabel">Filtro: <span class="font-bold">{{ activeFilterLabel }}</span></span>
            <span v-if="seleccionablesSeleccionados > 0" class="font-bold">{{ seleccionablesSeleccionados }} registros seleccionados</span>
          </div>

          <div class="overflow-x-auto">
            <div v-if="isLoading" class="text-center p-4">
              <span class="loading loading-lg loading-spinner text-primary"></span>
              <p>Cargando recibos...</p>
            </div>
            <div v-else-if="error" class="alert alert-error">
              <span>Error! Ha ocurrido un problema: {{ error }}</span>
            </div>
            <div v-else-if="paginatedRecibosSucursal.length > 0">
              <DataTable 
                :data="paginatedRecibosSucursal" 
                :columns="columns"
                row-key="CodReciboPr"
                :selected-row-key="selectedReciboKey"
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
        <ReciboDetailCard :recibo="selectedRecibo" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import DateRangeFilter from '@/components/DateRangeFilter.vue';
import DataTable from '@/components/DataTable.vue';
import PaginationControl from '@/components/PaginationControl.vue';
import ReciboDetailCard from '@/components/ReciboDetailCard.vue';
import { usePagos } from '../composables/usePagos';
import type { Recibo } from '../interfaces/Recibo';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';

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
  filteredRecibos
} = usePagos();

const { sucursales, isLoading: loadingSucursales } = useSucursales();
const sucursalesSeleccionadas = ref<number[]>([]);

// Buscador de sucursales
const textoBusquedaSucursal = ref('');
const sucursalesFiltradas = computed(() => {
  if (!textoBusquedaSucursal.value) return sucursales.value;
  return sucursales.value.filter(s =>
    s.NombreSuc.toLowerCase().includes(textoBusquedaSucursal.value.toLowerCase())
  );
});

// Estado para expandir/cerrar filtro de sucursal
const mostrarSucursalesFiltro = ref(false);
const toggleSucursalesFiltro = () => {
  mostrarSucursalesFiltro.value = !mostrarSucursalesFiltro.value;
};

const selectedRecibo = ref<any | null>(null);
const selectedReciboKey = computed(() => selectedRecibo.value?.CodReciboPr || null);

const activeFilterLabel = ref('');

const handleFilterUpdate = (filter: { from: string; to: string; label: string }) => {
  activeFilterLabel.value = filter.label;
  setDateRange(filter.from, filter.to);
  selectedRecibo.value = null;
};

const handleRowClick = (recibo: any) => {
  selectedRecibo.value = recibo;
};

// Observador para actualizar los filtros de teléfono cuando cambien en la UI
watch([filterValidPhones, filterInvalidPhones], ([valid, invalid]) => {
  setPhoneFilters(valid, invalid);
  selectedRecibo.value = null;
});

// Opción para seleccionar/deseleccionar todas
const toggleTodasSucursales = () => {
  if (sucursalesSeleccionadas.value.length === sucursales.value.length) {
    sucursalesSeleccionadas.value = [];
  } else {
    sucursalesSeleccionadas.value = sucursales.value.map(s => s.CodSucursal);
  }
};
const todasSeleccionadas = computed(() =>
  sucursales.value.length > 0 && sucursalesSeleccionadas.value.length === sucursales.value.length
);

// Computada para filtrar por sucursales seleccionadas
const recibosFiltradosPorSucursal = computed(() => {
  if (!sucursalesSeleccionadas.value.length) return filteredRecibos.value;
  return filteredRecibos.value.filter((recibo: any) => sucursalesSeleccionadas.value.includes(recibo.codSucRecibo));
});

// Computada para paginación sobre los recibos filtrados por sucursal
const paginatedRecibosSucursal = computed(() => {
  const start = (currentPage.value - 1) * 8;
  return recibosFiltradosPorSucursal.value.slice(start, start + 8);
});

const totalPagesSucursal = computed(() => Math.ceil(recibosFiltradosPorSucursal.value.length / 8));
const recordsInfoSucursal = computed(() => {
  const total = recibosFiltradosPorSucursal.value.length;
  if (total === 0) return '';
  const start = (currentPage.value - 1) * 8 + 1;
  const end = start + paginatedRecibosSucursal.value.length - 1;
  return `Mostrando ${start} - ${end} de ${total} registros`;
});

// Computada para contar solo los seleccionados con teléfono válido
const seleccionablesSeleccionados = computed(() => {
  return recibosFiltradosPorSucursal.value.filter((item: any) => {
    const telefono = item.telefonos;
    const digitsOnly = telefono ? telefono.replace(/\D/g, '') : '';
    const telefonoValido = digitsOnly.length >= 10;
    return telefonoValido && selectedKeys.value.has(item.codReciboPr);
  }).length;
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
