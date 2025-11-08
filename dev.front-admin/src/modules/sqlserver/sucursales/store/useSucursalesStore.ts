import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Sucursal } from '../interfaces/sucursal.interface';

export const useSucursalesStore = defineStore('useSucursalesStore', () => {
  const sucursales = ref<Sucursal[]>([]);
  const totalSucursales = computed(() => sucursales.value.length);

  // Define la acción como una función anónima dentro del objeto de retorno
  const setSucursales = (newSucursales: Sucursal[]) => {
    sucursales.value = newSucursales;
  };

  return {
    //* Props
    sucursales,

    //* Getters
    totalSucursales,

    //* Actions
    setSucursales,
  };
});
