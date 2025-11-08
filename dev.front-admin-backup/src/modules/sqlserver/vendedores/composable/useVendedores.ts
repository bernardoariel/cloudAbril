import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useVendedoresStore } from '../store/useVendedoresStore';
import { type VendedorResponse } from '../interfaces/vendedores.interface';
import { abrilApiData } from '@/api/abrilApiData';
const getVendedores = async (): Promise<VendedorResponse[]> => {
  const { data } = await abrilApiData.get<VendedorResponse[]>('/vendedores');
  return data;
};
export const useVendedores = () => {
  const store = useVendedoresStore();

  const { vendedores } = storeToRefs(store); // []

  const { isLoading, data } = useQuery({
    queryKey: ['vendedores'],
    queryFn: () => getVendedores(),
    staleTime: 1000 * 30,
  });

  watch(data, (newVendedores) => {
    if (newVendedores) store.setVendedores(newVendedores);
  });

  const findVendedorById = (id: number): VendedorResponse | undefined => {
    return vendedores.value.find((vendedor) => vendedor.codVendedor === id);
  };

  return {
    vendedores,
    isLoading,
    getVendedores,
    findVendedorById,
  };
};
