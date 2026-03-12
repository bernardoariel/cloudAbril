<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body p-3 md:p-6 flex flex-col">
      <WhatsAppTabs class="mb-4" />

      <!-- Fila 1: Título + controles principales -->
      <div class="flex flex-wrap justify-between items-center mb-2 gap-2">
        <h2 class="card-title text-base md:text-lg">{{ title }}</h2>
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Dropdown: Filtros Teléfono + Sucursal -->
          <div class="dropdown dropdown-end">
            <label tabindex="0" class="btn btn-outline btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
              </svg>
              Filtros
              <span v-if="activePhoneFilter" class="badge badge-primary badge-xs"></span>
            </label>
            <div tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-64 mt-2 z-50">
              <div class="p-2 font-bold">Filtrar por Teléfono</div>
              <label class="label cursor-pointer">
                <span class="label-text">Solo válidos</span>
                <input type="checkbox" :checked="filterValidPhones" class="checkbox checkbox-primary"
                  @change="onPhoneFilterChange(($event.target as HTMLInputElement).checked, filterInvalidPhones)" />
              </label>
              <label class="label cursor-pointer">
                <span class="label-text">Solo inválidos</span>
                <input type="checkbox" :checked="filterInvalidPhones" class="checkbox checkbox-primary"
                  @change="onPhoneFilterChange(filterValidPhones, ($event.target as HTMLInputElement).checked)" />
              </label>
              <!-- Filtro sucursal (si hay sucursales) -->
              <template v-if="sucursales && sucursales.length > 0">
                <div class="divider my-1"></div>
                <div class="flex items-center justify-between p-2 font-bold cursor-pointer select-none" @click="mostrarSucursalesFiltro = !mostrarSucursalesFiltro">
                  <span>Por Sucursal</span>
                  <svg v-if="!mostrarSucursalesFiltro" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </div>
                <transition name="fade">
                  <div v-if="mostrarSucursalesFiltro">
                    <input type="text" v-model="textoBusquedaSucursal" placeholder="Buscar sucursal..." class="input input-bordered input-sm w-full mb-2" />
                    <label class="label cursor-pointer">
                      <span class="label-text font-semibold">Todas</span>
                      <input type="checkbox" class="checkbox checkbox-primary" :checked="todasSucursalesSeleccionadas" @change="toggleTodasSucursales" />
                    </label>
                    <div class="max-h-40 overflow-y-auto">
                      <label v-for="s in sucursalesFiltradas" :key="s.CodSucursal" class="label cursor-pointer">
                        <span class="label-text">{{ s.NombreSuc }}</span>
                        <input type="checkbox" class="checkbox checkbox-primary" :value="s.CodSucursal"
                          v-model="sucursalesSeleccionadas" @change="currentPage = 1" />
                      </label>
                    </div>
                  </div>
                </transition>
              </template>
            </div>
          </div>

          <!-- Selector de fecha -->
          <DateRangeFilter @filter-applied="handleFilterUpdate" />

          <!-- Enviar WhatsApp -->
          <button class="btn btn-success btn-sm" @click="$emit('open-whats-modal')" :disabled="seleccionablesCount === 0">
            Enviar WhatsApp
            <span v-if="seleccionablesCount > 0" class="badge badge-sm badge-accent ml-1">{{ seleccionablesCount }}</span>
          </button>
        </div>
      </div>

      <!-- Fila 2: Buscador + botón exportar inválidos -->
      <div class="flex flex-wrap gap-2 mb-3 items-center">
        <div class="join flex-1 min-w-[200px]">
          <input v-model="searchText" type="text" placeholder="Buscar en la tabla..." class="input input-bordered input-sm join-item w-full" @input="currentPage = 1" />
          <button v-if="searchText" class="btn btn-sm join-item btn-ghost" @click="searchText = ''; currentPage = 1" title="Limpiar búsqueda">✕</button>
        </div>
        <button v-if="invalidPhonesInView > 0" class="btn btn-warning btn-sm gap-1" @click="exportInvalidPhonesToXls" :title="`Exportar ${invalidPhonesInView} registros con teléfonos inválidos a Excel`">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excel inválidos ({{ invalidPhonesInView }})
        </button>
      </div>

      <!-- Barra info: filtro activo + seleccionados -->
      <div v-if="activeFilterLabel || seleccionablesCount > 0" class="flex flex-wrap justify-between items-center p-3 bg-base-200 rounded-lg text-sm mb-3 gap-2">
        <span v-if="activeFilterLabel">Filtro: <span class="font-bold">{{ activeFilterLabel }}</span></span>
        <span v-if="seleccionablesCount > 0" class="font-bold text-success">{{ seleccionablesCount }} seleccionados con tel. válido</span>
      </div>

      <!-- Tabla -->
      <div class="overflow-x-auto flex-1">
        <div v-if="isLoading" class="text-center p-6">
          <span class="loading loading-lg loading-spinner text-primary"></span>
          <p class="mt-2">{{ loadingMessage ?? 'Cargando...' }}</p>
        </div>
        <div v-else-if="error" class="alert alert-error">
          <span>Error: {{ error }}</span>
        </div>
        <template v-else-if="paginatedData.length > 0">
          <table class="table table-zebra w-full" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th class="w-8">
                  <input type="checkbox" class="checkbox" :checked="isAllSelected"
                    @change="$emit('set-select-all', ($event.target as HTMLInputElement).checked)" />
                </th>
                <th v-for="col in columns" :key="col.key"
                  class="cursor-pointer select-none whitespace-nowrap"
                  @click="toggleSort(col.key)">
                  <span class="flex items-center gap-1">
                    {{ col.label }}
                    <span class="text-xs opacity-60">
                      <template v-if="sortKey === col.key">{{ sortDir === 'asc' ? '↑' : '↓' }}</template>
                      <template v-else>↕</template>
                    </span>
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedData" :key="item[rowKey]"
                :class="[item[rowKey] === selectedRowKey ? 'active' : '', !isTelValido(item) ? 'text-error opacity-80' : '']">
                <td class="w-8">
                  <template v-if="mensajeEnviado(item)">
                    <button class="btn btn-ghost btn-xs" @click.stop="$emit('whatsapp-detail-clicked', mensajeEnviado(item))" title="Ver mensaje enviado">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                    </button>
                  </template>
                  <template v-else-if="isTelValido(item)">
                    <input type="checkbox" class="checkbox" :checked="selectedKeys.has(item[rowKey])"
                      @change="$emit('toggle-row-selection', item[rowKey])" />
                  </template>
                  <template v-else>
                    <span title="Teléfono inválido" class="text-warning text-base flex justify-center">⚠</span>
                  </template>
                </td>
                <td v-for="col in columns" :key="col.key" @click="$emit('row-clicked', item)" class="cursor-pointer">
                  <span v-if="isHtmlColumn(col.key)" v-html="getCellValue(item, col)"></span>
                  <span v-else>{{ getCellValue(item, col) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </template>
        <div v-else-if="!isLoading && !error" class="text-center p-6 text-base-content/60">
          <p>No se encontraron registros con los filtros aplicados.</p>
        </div>
      </div>

      <!-- Paginación: FUERA del overflow-x-auto para que siempre sea visible -->
      <div class="pt-2 border-t border-base-200 mt-2">
        <PaginationControl
          v-if="!isLoading && !error && dataSorted.length > 0"
          :current-page="currentPage"
          :total-pages="totalPages"
          :records-info="recordsInfo"
          @page-changed="setPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DateRangeFilter from '@/components/DateRangeFilter.vue';
import PaginationControl from '@/components/PaginationControl.vue';
import WhatsAppTabs from '@/components/WhatsAppTabs.vue';

interface Column {
  key: string;
  label: string;
  format?: (item: any) => string;
}

interface Sucursal {
  CodSucursal: number;
  NombreSuc: string;
}

const props = defineProps<{
  title: string;
  isLoading: boolean;
  loadingMessage?: string;
  error: any;
  /** Datos ya filtrados por fecha y por teléfono (del composable) */
  baseData: any[];
  columns: Column[];
  rowKey: string;
  selectedRowKey?: string | number | null;
  selectedKeys: Set<string | number>;
  isAllSelected: boolean;
  mensajesEnviados?: any[];
  filterValidPhones: boolean;
  filterInvalidPhones: boolean;
  /** Lista de sucursales para el filtro desplegable */
  sucursales?: Sucursal[];
  /** Campo en el item de datos que contiene el código de sucursal */
  sucursalKey?: string;
  /** Campo en el item de datos que contiene el teléfono (default: 'Telefonos') */
  phoneField?: string;
  /** Campos a incluir en búsqueda de texto */
  searchFields?: string[];
}>();

const emit = defineEmits<{
  (e: 'phone-filters-update', valid: boolean, invalid: boolean): void;
  (e: 'filter-date-update', filter: { from: string; to: string; label: string }): void;
  (e: 'row-clicked', item: any): void;
  (e: 'toggle-row-selection', key: string | number): void;
  (e: 'set-select-all', checked: boolean): void;
  (e: 'whatsapp-detail-clicked', mensaje: any): void;
  (e: 'open-whats-modal'): void;
}>();

// ── Estado interno ──────────────────────────────────────────────────────────
const searchText = ref('');
const sortKey = ref<string | null>(null);
const sortDir = ref<'asc' | 'desc'>('asc');
const sucursalesSeleccionadas = ref<number[]>([]);
const currentPage = ref(1);
const mostrarSucursalesFiltro = ref(false);
const textoBusquedaSucursal = ref('');
const activeFilterLabel = ref('');

const PAGE_SIZE = 8;

// ── Helpers ─────────────────────────────────────────────────────────────────
const resolvedPhoneField = computed(() => props.phoneField ?? 'Telefonos');

const isTelValido = (item: any): boolean => {
  const tel = item[resolvedPhoneField.value];
  if (!tel) return false;
  return tel.replace(/\D/g, '').length >= 10;
};

const getCellValue = (item: any, col: Column): any => {
  if (col.format) return col.format(item);
  return item[col.key] ?? '';
};

const isHtmlColumn = (key: string) =>
  ['Nombre', 'NombreCont', 'CodReciboPr'].includes(key);

const mensajeEnviado = (item: any) => {
  if (!props.mensajesEnviados?.length) return null;
  const sourceId = String(item.venta_CodVenta ?? item.CodReciboPr ?? item.codReciboPr ?? '');
  return props.mensajesEnviados.find((m: any) => m.source_id === sourceId) ?? null;
};

// ── Filtro sucursales ───────────────────────────────────────────────────────
const sucursalesFiltradas = computed(() => {
  if (!props.sucursales) return [];
  if (!textoBusquedaSucursal.value) return props.sucursales;
  return props.sucursales.filter(s =>
    s.NombreSuc.toLowerCase().includes(textoBusquedaSucursal.value.toLowerCase()),
  );
});

const todasSucursalesSeleccionadas = computed(() =>
  !!props.sucursales?.length && sucursalesSeleccionadas.value.length === props.sucursales.length,
);

const toggleTodasSucursales = () => {
  if (todasSucursalesSeleccionadas.value) {
    sucursalesSeleccionadas.value = [];
  } else {
    sucursalesSeleccionadas.value = (props.sucursales ?? []).map(s => s.CodSucursal);
  }
  currentPage.value = 1;
};

// ── Pipeline de filtrado: baseData → sucursal → búsqueda → sort ───────────
const dataFiltradaSucursal = computed(() => {
  if (!sucursalesSeleccionadas.value.length) return props.baseData;
  const sucKey = props.sucursalKey ?? 'CodSucursal';
  return props.baseData.filter(item => sucursalesSeleccionadas.value.includes(item[sucKey]));
});

const dataFiltradaBusqueda = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  if (!q) return dataFiltradaSucursal.value;
  const fields = props.searchFields ?? props.columns.map(c => c.key);
  return dataFiltradaSucursal.value.filter(item =>
    fields.some(f => String(item[f] ?? '').toLowerCase().includes(q)),
  );
});

const dataSorted = computed(() => {
  if (!sortKey.value) return dataFiltradaBusqueda.value;
  const key = sortKey.value;
  return [...dataFiltradaBusqueda.value].sort((a, b) => {
    const va = a[key] ?? '';
    const vb = b[key] ?? '';
    let cmp = 0;
    if (typeof va === 'number' && typeof vb === 'number') {
      cmp = va - vb;
    } else {
      cmp = String(va).localeCompare(String(vb), 'es-AR', { numeric: true, sensitivity: 'base' });
    }
    return sortDir.value === 'asc' ? cmp : -cmp;
  });
});

/** Datos completos después de todos los filtros (sin paginar). Expuesto para el padre. */
const allFilteredData = computed(() => dataSorted.value);

// ── Paginación ──────────────────────────────────────────────────────────────
const totalPages = computed(() => Math.max(1, Math.ceil(dataSorted.value.length / PAGE_SIZE)));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  return dataSorted.value.slice(start, start + PAGE_SIZE);
});

const recordsInfo = computed(() => {
  const total = dataSorted.value.length;
  if (!total) return '';
  const start = (currentPage.value - 1) * PAGE_SIZE + 1;
  const end = Math.min(start + PAGE_SIZE - 1, total);
  return `Mostrando ${start} - ${end} de ${total} registros`;
});

const setPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page;
};

// ── Contadores ──────────────────────────────────────────────────────────────
const invalidPhonesInView = computed(() =>
  dataFiltradaBusqueda.value.filter(item => !isTelValido(item)).length,
);

const seleccionablesCount = computed(() =>
  allFilteredData.value.filter((item: any) => isTelValido(item) && props.selectedKeys.has(item[props.rowKey])).length,
);

// ── Filtros teléfono ────────────────────────────────────────────────────────
const activePhoneFilter = computed(() => props.filterValidPhones || props.filterInvalidPhones);

const onPhoneFilterChange = (valid: boolean, invalid: boolean) => {
  emit('phone-filters-update', valid, invalid);
  currentPage.value = 1;
};

// ── Fechas ──────────────────────────────────────────────────────────────────
const handleFilterUpdate = (filter: { from: string; to: string; label: string }) => {
  activeFilterLabel.value = filter.label;
  emit('filter-date-update', filter);
  currentPage.value = 1;
};

// ── Ordenamiento ─────────────────────────────────────────────────────────────
const toggleSort = (key: string) => {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
  currentPage.value = 1;
};

// ── Exportar inválidos a Excel (.xls HTML-table, patrón CRISTAL adaptado a JS) ─
const stripHtml = (str: string) => String(str).replace(/<[^>]*>/g, '');

const exportInvalidPhonesToXls = () => {
  const invalids = dataFiltradaBusqueda.value.filter((item: any) => !isTelValido(item));
  if (!invalids.length) return;

  // Cabeceras bold
  const headerCells = props.columns
    .map(c => `<td style="font-weight:bold;border:1px solid #ccc;background:#f5f5f5;">${c.label}</td>`)
    .join('');

  // Filas de datos — texto plano (sin HTML), igual que el patrón PHP del skill
  const dataRows = invalids
    .map(item => {
      const cells = props.columns
        .map(c => {
          const raw = c.format ? stripHtml(c.format(item)) : String(item[c.key] ?? '');
          return `<td style="border:1px solid #eee;">${raw}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  // HTML table con BOM UTF-8 (obligatorio para que Excel abra tildes correctamente)
  const html =
    `\uFEFF<html xmlns:o="urn:schemas-microsoft-com:office:office" ` +
    `xmlns:x="urn:schemas-microsoft-com:office:excel">` +
    `<head><meta charset="UTF-8"></head><body>` +
    `<table border="0"><tr>${headerCells}</tr>${dataRows}</table>` +
    `</body></html>`;

  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `telefonos-invalidos-${new Date().toISOString().slice(0, 10)}.xls`;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Exponer datos para el componente padre ──────────────────────────────────
defineExpose({ allFilteredData });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
