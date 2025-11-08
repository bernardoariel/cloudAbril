import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Marcas } from '../interfaces/marcas.interfaces';

export const useMarcasStore = defineStore('useMarcasStore', () => {
  const marcas = ref<Marcas[]>([]);

  return {
    //* Props

    //* Getters

    //* Actions
    marcas,
    setMarcas(newMarcas: Marcas[]) {
      marcas.value = newMarcas;
    },
  };
});