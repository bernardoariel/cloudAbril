import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useSucursalesStore } from '../store/useSucursalesStore';
import { type SucursalResponse } from '../interfaces/sucursal.interface';
import { abrilApiData } from '@/api/abrilApiData';
const getSucursales = async (): Promise<SucursalResponse[]> => {
  const { data } = await abrilApiData.get<SucursalResponse[]>('/prod-sucursal');
  return data;
};
export const useSucursales = () => {
  const store = useSucursalesStore();

  const { sucursales } = storeToRefs(store); // []

  const { isLoading, data } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => getSucursales(),
    staleTime: 1000 * 30,
  });

  watch(data, (newSucursales) => {
    if (newSucursales) store.setSucursales(newSucursales);
  });

  const findSucursalById = (id: number): SucursalResponse | undefined => {
    return sucursales.value.find((sucursal) => sucursal.CodSucursal === id);
  };

  return {
    sucursales,
    isLoading,
    getSucursales,
    findSucursalById,
  };
};
