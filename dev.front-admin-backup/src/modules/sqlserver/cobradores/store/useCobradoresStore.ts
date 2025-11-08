import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Cobrador } from '../interfaces/cobrador.interface';

export const useCobradoresStore = defineStore('useCobradoresStore', () => {
  const cobradores = ref<Cobrador[]>([]);
  const totalCobradores = computed(() => cobradores.value.length);

  // Define la acción como una función anónima dentro del objeto de retorno
  const setCobradores = (newCobradores: Cobrador[]) => {
    cobradores.value = newCobradores;
  };

  return {
    //* Props
    cobradores,

    //* Getters
    totalCobradores,

    //* Actions
    setCobradores,
  };
});
