import { ref, watch } from 'vue';
import { useProductStore } from '@/store/useProductStore';
import type { Producto } from '@/interfaces/products.interface';
import { abrilApiData } from '@/api/abrilApiData';
import { storeToRefs } from 'pinia';
import { useQuery } from '@tanstack/vue-query';

const fetchProducts = async (product: string) => {
  const { data } = await abrilApiData.get<Producto[]>(`/productos`);
  return data;
};

export function useProduct() {
  const store = useProductStore();
  const { products } = storeToRefs(store);
  const productToSearch = ref<string>('');

  const { isFetching, data } = useQuery({
    queryKey: ['products', productToSearch.value],
    queryFn: () => fetchProducts(productToSearch.value),
  });

  watch(data, (newProducts) => {
    if (newProducts) {
      store.setProducts(newProducts);
    }
  });

  const triggerSearch = async () => {
    const resp = await fetchProducts(productToSearch.value);
    store.setProducts(resp);
  };

  const findProductById = (id: string): Producto | undefined => {
    if (Array.isArray(products.value)) {
      return products.value.find((product) => product.CodProducto === id);
    }
    return products.value;
  };

  return {
    isFetching,
    productToSearch,
    triggerSearch,
    products,
    findProductById,
  };
}
