import { ref, computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { getVentasByDateRange } from '../api/ventasApi';
import type { Venta } from '../interfaces/Venta';

// --- Funciones de formato ---
const formatPhoneNumber = (phone: string | null | undefined): string => {
  if (!phone) return 'S/N';
  const digitsOnly = phone.replace(/\D/g, '');
  const relevantDigits = digitsOnly.length > 10 ? digitsOnly.slice(-10) : digitsOnly;
  if (relevantDigits.length === 10) {
    const [area, first, second] = [relevantDigits.substring(0, 3), relevantDigits.substring(3, 6), relevantDigits.substring(6, 10)];
    return `${area} ${first} ${second}`;
  }
  return phone;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-AR', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' });
};

const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-AR')}`;
}

// --- Definición de columnas ---
const columns = ref([
  { key: 'venta_Fecha', label: 'Fecha', format: (item: Venta) => formatDate(item.venta_Fecha) },
  { key: 'Nombre', label: 'Nombre Cliente', format: (item: Venta) => `${item.NombreCont || ''} ${item.ApellidoCont || ''}`.trim() },
  { key: 'venta_CodVenta', label: 'Cod. Venta' },
  { key: 'Telefonos', label: 'Teléfonos', format: (item: Venta) => formatPhoneNumber(item.Telefonos) },
  { key: 'venta_Total', label: 'Total', format: (item: Venta) => formatCurrency(item.venta_Total) },
  /* { key: 'venta_FormaPago', label: 'Forma de Pago', format: (item: Venta) => item.venta_FormaPago.trim() },
  { key: 'venta_Estado', label: 'Estado' }, */
  
]);

// --- Composable principal ---
export const useVentas = () => {
  // --- Estado Interno ---
  const dateFrom = ref('');
  const dateTo = ref('');
  const filterValidPhones = ref(false);
  const filterInvalidPhones = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(8);
  const selectedKeys = ref(new Set<string | number>());

  // --- Lógica de la API y Filtrado ---
  const { data: ventas, isLoading, error } = useQuery({
    queryKey: ['ventas', dateFrom, dateTo],
    queryFn: () => getVentasByDateRange(dateFrom.value, dateTo.value),
    initialData: [],
  });

  const isValidPhone = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7;
  };

  const filteredVentas = computed(() => {
    const showValid = filterValidPhones.value;
    const showInvalid = filterInvalidPhones.value;
    if (showValid === showInvalid) return ventas.value;
    return ventas.value.filter(v => showValid ? isValidPhone(v.Telefonos) : !isValidPhone(v.Telefonos));
  });

  // --- Lógica de Selección ---
  const isAllSelected = computed(() => 
    filteredVentas.value.length > 0 && selectedKeys.value.size === filteredVentas.value.length
  );

  watch(filteredVentas, (newVentas) => {
    selectedKeys.value = new Set(newVentas.map(v => v.venta_CodVenta));
  }, { deep: true });

  const toggleRowSelection = (key: string | number) => {
    if (selectedKeys.value.has(key)) {
      selectedKeys.value.delete(key);
    } else {
      selectedKeys.value.add(key);
    }
  };

  const setSelectAll = (select: boolean) => {
    if (select) {
      selectedKeys.value = new Set(filteredVentas.value.map(v => v.venta_CodVenta));
    } else {
      selectedKeys.value.clear();
    }
  };
  
  // --- Lógica de Paginación (ahora se basa en los seleccionados) ---
  const paginatedVentas = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    // Paginar sobre la lista filtrada completa
    return filteredVentas.value.slice(start, start + itemsPerPage.value);
  });

  // --- Lógica de Paginación ---
  const totalPages = computed(() => Math.ceil(filteredVentas.value.length / itemsPerPage.value));
  const recordsInfo = computed(() => {
    const total = filteredVentas.value.length;
    if (total === 0) return '';
    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = start + paginatedVentas.value.length - 1;
    return `Mostrando ${start} - ${end} de ${total} registros`;
  });

  // --- Funciones de Mutación de Estado ---
  const setDateRange = (from: string, to: string) => {
    dateFrom.value = from;
    dateTo.value = to;
    currentPage.value = 1;
  };

  const setPhoneFilters = (valid: boolean, invalid: boolean) => {
    filterValidPhones.value = valid;
    filterInvalidPhones.value = invalid;
    currentPage.value = 1;
  };

  const setPage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
      currentPage.value = page;
    }
  };

  // --- Lo que se expone a la vista ---
  return {
    // Estado
    isLoading,
    error,
    // Datos y Columnas para la tabla
    columns,
    paginatedData: paginatedVentas,
    filteredVentas,
    // Estado y Datos para la paginación
    currentPage,
    totalPages,
    recordsInfo,
    // Estado de los filtros (para la UI)
    filterValidPhones,
    filterInvalidPhones,
    dateFrom, // Exponemos esto por si la UI lo necesita
    dateTo,
    // Estado de selección
    selectedKeys,
    isAllSelected,
    // Mutaciones
    setDateRange,
    setPhoneFilters,
    setPage,
    toggleRowSelection,
    setSelectAll,
  };
}; 