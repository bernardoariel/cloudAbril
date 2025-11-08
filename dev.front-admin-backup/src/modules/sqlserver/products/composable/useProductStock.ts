import { computed, watch } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import type { ProductsStockResponse } from '../interfaces/productsStock.response';
import type { ProductsResponse } from '../interfaces/products.response';
import { useProductStore } from '../store/useProductStore';
import { getProductsStock, getProducts } from '../services/actions';
import { storeToRefs } from 'pinia';

export const useProductStock = () => {
  const store = useProductStore();
  const { productos, productCantidad } = storeToRefs(store);

  const stockQuery = useQuery<ProductsStockResponse[]>({
    queryKey: ['productos-stock'],
    queryFn: () => getProductsStock(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });

  const productsQuery = useQuery<ProductsResponse[]>({
    queryKey: ['productos2'],
    queryFn: () => getProducts(),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 30,
    retry: false,
    enabled: !!stockQuery.data, // Habilita solo cuando stockQuery tiene datos
  });

  // Computed para filtrar productos que tienen stock
  const productsWithStock = computed(() => {
    // Verifica si `stockQuery.data` y `productsQuery.data` son arrays válidos
    if (!Array.isArray(stockQuery.data) || !Array.isArray(productsQuery.data)) return [];

    const stockMap = new Map(stockQuery.data.map((stock) => [stock.CodProducto, stock.Cantidad]));

    return productsQuery.data.filter(
      (product) => stockMap.has(product.CodProducto) && stockMap.get(product.CodProducto)! > 0,
    );
  });

  // Guarda los productos con stock en el store
  watch(productsWithStock, (newProductsWithStock) => {
    console.log('Productos con stock:', newProductsWithStock);
    store.setProducts(newProductsWithStock);
  });
  stockQuery.data && console.log('Stock Data:', stockQuery.data);
  productsQuery.data && console.log('Products Data:', productsQuery.data);
  return {
    productsWithStock,
    isLoading: stockQuery.isLoading || productsQuery.isLoading,
  };
};
