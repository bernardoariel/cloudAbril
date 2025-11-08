import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Vendedor } from '../interfaces/vendedores.interface';

export const useVendedoresStore = defineStore('useVendedoresStore', () => {
  const vendedores = ref<Vendedor[]>([]);
  const totalVendedores = computed(() => vendedores.value.length);

  // Define la acción como una función anónima dentro del objeto de retorno
  const setVendedores = (newVendedores: Vendedor[]) => {
    vendedores.value = newVendedores;
  };

  return {
    //* Props
    vendedores,

    //* Getters
    totalVendedores,

    //* Actions
    setVendedores,
  };
});
