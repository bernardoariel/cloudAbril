import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Venta } from '../interfaces/Venta';

export const useVentasStore = defineStore('ventas', () => {
  const ventas = ref<Venta[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  return {
    // State
    ventas,
    isLoading,
    error,

    // Getters (opcional, pero buena practica)
    // ventasCount: computed(() => ventas.value.length),

    // Actions
    setVentas(newVentas: Venta[]) {
      ventas.value = newVentas;
    },
    setLoading(loading: boolean) {
      isLoading.value = loading;
    },
    setError(newError: string | null) {
      error.value = newError;
    }
  };
}); 