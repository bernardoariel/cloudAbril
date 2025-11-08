import { ref, computed } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { getRecibosByDateRange } from '../api/recibosApi';
import type { Recibo } from '../interfaces/Recibo';
import { useSelection } from './useSelection';

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

const formatCurrency = (amount: number | undefined | null) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '';
  return `$${amount.toLocaleString('es-AR')}`;
}

// --- Definición de columnas ---
const columns = ref([
  { key: 'Fecha', label: 'Fecha', format: (item: any) => formatDate(item.Fecha) },
  { key: 'NombreCont', label: 'Nombre Cliente', format: (item: any) => `${item.NombreCont || ''} ${item.ApellidoCont || ''}`.trim() },
  { key: 'CodCredito', label: 'Cod. Crédito' },
  { key: 'Telefonos', label: 'Teléfonos', format: (item: any) => formatPhoneNumber(item.Telefonos) },
  { key: 'MontoPagado', label: 'Importe', format: (item: any) => formatCurrency(item.MontoPagado) },
]);

// --- Composable principal ---
export const usePagos = () => {
  // --- Estado Interno ---
  const dateFrom = ref('');
  const dateTo = ref('');
  const filterValidPhones = ref(false);
  const filterInvalidPhones = ref(false);
  const currentPage = ref(1);
  const itemsPerPage = ref(8);


  // --- Lógica de la API y Filtrado ---
  const { data: recibos, isLoading, error } = useQuery({
    queryKey: ['recibos', dateFrom, dateTo],
    queryFn: () => getRecibosByDateRange(dateFrom.value, dateTo.value),
    initialData: [],
  });

  const isValidPhone = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, '');
    return digitsOnly.length >= 7;
  };

  const filteredRecibos = computed(() => {
    const showValid = filterValidPhones.value;
    const showInvalid = filterInvalidPhones.value;
    if (showValid === showInvalid) return recibos.value;
    return recibos.value.filter(r => showValid ? isValidPhone(r.Telefonos) : !isValidPhone(r.Telefonos));
  });

  const {
    selectedKeys,
    isAllSelected,
    toggleRowSelection,
    setSelectAll,
  } = useSelection(filteredRecibos, 'CodReciboPr');
  
  // --- Lógica de Paginación (ahora se basa en los seleccionados) ---
  const paginatedRecibos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    // Paginar sobre la lista filtrada completa
    return filteredRecibos.value.slice(start, start + itemsPerPage.value);
  });

  // --- Lógica de Paginación ---
  const totalPages = computed(() => Math.ceil(filteredRecibos.value.length / itemsPerPage.value));
  const recordsInfo = computed(() => {
    const total = filteredRecibos.value.length;
    if (total === 0) return '';
    const start = (currentPage.value - 1) * itemsPerPage.value + 1;
    const end = start + paginatedRecibos.value.length - 1;
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
    paginatedData: paginatedRecibos,
    filteredRecibos,
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