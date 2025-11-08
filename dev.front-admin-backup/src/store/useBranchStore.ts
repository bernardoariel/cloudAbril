import type { Branch } from '@/interfaces/branch.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBranchStore = defineStore('branches', () => {
    const branches = ref<Branch[]>([]);
    const isLoading = ref(false);
    const isError = ref(false);
    const error = ref<Error | null>(null);

    const fetchAllBranches = async () => {
        isLoading.value = true;
        isError.value = false;
        error.value = null;

        try {
            const response = await fetch(`http://localhost:3000/prod-marca`);
            if (!response.ok) {
                throw new Error('Error al obtener las marcas');
            }
            const data = await response.json();
            branches.value = data;
        } catch (err) {
            isError.value = true;
            error.value = err instanceof Error ? err : new Error('Unknown error');
        } finally {
            isLoading.value = false;
        }
    };

    return {
        fetchAllBranches,
        branches
    }
}
)
