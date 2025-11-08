import type { Sucursales } from '@/interfaces/sucursales.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSucursalesStore = defineStore('sucursales', () => {
    const sucursales = ref<Sucursales[]>([]);
    const isLoading = ref(false);
    const isError = ref(false);
    const error = ref<Error | null>(null);

    const fetchAllSucursales = async ()=> {
        isLoading.value = true;
        isError.value = false;
        error.value = null;

        try {
            const response = await fetch(`http://localhost:3000/prod-sucursal`);
            if (!response.ok) {
                throw new Error('Error al obtener las sucursales');
            }
            const data = await response.json();
            sucursales.value = data;
        } catch (err) {
            isError.value = true;
            error.value = err instanceof Error ? err : new Error('Unknown error');
        } finally {
            isLoading.value = false;
        }
    };

    return {
        fetchAllSucursales,
        sucursales
    }
}
)
