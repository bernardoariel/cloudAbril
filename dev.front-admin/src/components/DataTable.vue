<script setup lang="ts">
import { computed } from 'vue';

interface Column {
  key: string;
  label: string;
  format?: (item: any) => string;
}

const props = defineProps<{
  data: any[];
  columns: Column[];
  rowKey: string;
  selectedKeys: Set<string | number>;
  selectedRowKey?: string | number | null;
  isAllSelected: boolean;
  mensajesEnviados?: any[]; // Agregar historial de mensajes
}>();

console.log('Props recibidas en DataTable:', props.data);
const emit = defineEmits<{
  (e: 'row-clicked', item: any): void;
  (e: 'set-select-all', checked: boolean): void;
  (e: 'toggle-row-selection', key: string | number): void;
  (e: 'whatsapp-detail-clicked', item: any): void; // Nuevo evento para mostrar detalle
}>();

const getCellValue = (item: any, column: Column) => {
  if (column.format) {
    return column.format(item);
  }
  if (column.key === 'Nombre' && typeof item[column.key] === 'string') {
    const nombre = item[column.key];
    return nombre.length > 20 ? nombre.slice(0, 20) + '...' : nombre;
  }
  return item[column.key];
};

const isTelefonoValido = (telefono: string | null | undefined): boolean => {
  if (!telefono) return false;
  const digitsOnly = telefono.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

const dataConTelefonoValido = computed(() =>
  props.data.map(item => ({
    ...item,
    telefonoValido: isTelefonoValido(item.Telefonos)
  }))
);

// Verificar si ya existe un mensaje enviado para este registro
const mensajeEnviado = (item: any) => {
  if (!props.mensajesEnviados || props.mensajesEnviados.length === 0) return null;
  
  const sourceId = String(item.venta_CodVenta || item.CodReciboPr || item.codReciboPr);
  return props.mensajesEnviados.find(m => m.source_id === sourceId) || null;
};
</script>

<template>
  <div class="overflow-x-auto">
    <table class="table table-zebra w-full">
      <thead>
        <tr>
          <th>
            <label>
              <input 
                type="checkbox" 
                class="checkbox"
                :checked="isAllSelected"
                @change="emit('set-select-all', ($event.target as HTMLInputElement).checked)"
              />
            </label>
          </th>
          <th v-for="column in columns" :key="column.key">
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="item in dataConTelefonoValido" 
          :key="item[rowKey]" 
          :class="[ { 'active': item[rowKey] === selectedRowKey }, !item.telefonoValido ? 'text-danger' : '' ]"
        >
          <td>
            <template v-if="mensajeEnviado(item)">
              <!-- Ya fue enviado por WhatsApp -->
              <button 
                class="btn btn-ghost btn-xs"
                @click.stop="emit('whatsapp-detail-clicked', mensajeEnviado(item))"
                title="Ver detalle del mensaje enviado"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-success" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </button>
            </template>
            <template v-else-if="item.telefonoValido">
              <label>
                <input 
                  type="checkbox" 
                  class="checkbox" 
                  :checked="selectedKeys.has(item[rowKey])"
                  @change="emit('toggle-row-selection', item[rowKey])"
                />
              </label>
            </template>
            <template v-else>
              <span title="Teléfono inválido" style="color: #dc3545; font-size: 1.2em; display: flex; align-items: center; justify-content: center;">
                &#9888;
              </span>
            </template>
          </td>
          <td v-for="column in columns" :key="column.key" @click="emit('row-clicked', item)" class="cursor-pointer">
            <span v-if="column.key === 'Nombre' || column.key === 'NombreCont' || column.key === 'CodReciboPr'" v-html="getCellValue(item, column)"></span>
            <span v-else>{{ getCellValue(item, column) }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.text-danger {
  color: #dc3545;
}
table, th, td {
  font-size: 0.85rem;
}
</style> 