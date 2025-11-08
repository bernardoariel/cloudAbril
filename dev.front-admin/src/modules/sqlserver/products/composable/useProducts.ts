import { computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';

import { getProducts, getProductByMarcas } from '../services/actions';
import type { ProductsResponse } from '../interfaces/products.response';
import { useProductStore } from '../store/useProductStore';
import { storeToRefs } from 'pinia';

interface Options {
  term: string;
  searchByMarcas?: boolean;
}

export const useProducts = () => {
  const store = useProductStore();
  const { productos } = storeToRefs(store);

  const { isLoading, data } = useQuery<ProductsResponse[]>({
    queryKey: ['productos'],
    queryFn: () => getProducts(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30, // los datos se consideran frescos por 1 hora
    retry: false,
  });

  watch(data, (newProducts) => {
    if (newProducts) {
      store.setProducts(newProducts);
    }
  });

  return {
    productos,
    isLoading,
  };
};
