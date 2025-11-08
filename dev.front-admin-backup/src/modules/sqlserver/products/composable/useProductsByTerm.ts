import { useQuery } from '@tanstack/vue-query';
import { getProducts, getProductByMarcas, getProductById } from '../services/actions';
import type { ProductsResponse } from '../interfaces/products.response';
import { computed } from 'vue';

interface Options {
  term: string;
  searchByMarcas?: boolean;
}

export const useProductsByTerm = ({ term, searchByMarcas = false }: Options) => {
  const { isLoading, isError, error, data } = useQuery<ProductsResponse[]>({
    queryKey: ['producto', term, searchByMarcas ? 'marcas' : 'productos'],
    queryFn: () => {
      if (searchByMarcas) {
        return getProductByMarcas({ term });
      } else {
        return getProductById(term);
      }
    },
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60, // los datos se consideran frescos por 1 minuto
    retry: false,
  });

  // Usamos computed para manejar los datos, garantizando que 'productos' siempre sea un array
  const productos = computed<ProductsResponse[]>(() => {
    return data.value && Array.isArray(data.value) ? data.value : []; // Validamos que sea un array
  });

  return {
    productos,
    isLoading,
    isError,
    error,
  };
};
