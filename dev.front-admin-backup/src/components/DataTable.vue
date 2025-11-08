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
}>();

console.log('Props recibidas en DataTable:', props.data);
const emit = defineEmits<{
  (e: 'row-clicked', item: any): void;
  (e: 'set-select-all', checked: boolean): void;
  (e: 'toggle-row-selection', key: string | number): void;
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
            <template v-if="item.telefonoValido">
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
            {{ getCellValue(item, column) }}
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