import { useQuery } from '@tanstack/vue-query';
import { watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useCobradoresStore } from '../store/useCobradoresStore';
import { type CobradorResponse } from '../interfaces/cobrador.interface';
import { abrilApiData } from '@/api/abrilApiData';
const getCobradores = async (): Promise<CobradorResponse[]> => {
  const { data } = await abrilApiData.get<CobradorResponse[]>('/cobradores');
  return data;
};
export const useCobradores = () => {
  const store = useCobradoresStore();

  const { cobradores } = storeToRefs(store); // []

  const { isLoading, data } = useQuery({
    queryKey: ['cobradores'],
    queryFn: () => getCobradores(),
    staleTime: 1000 * 30,
  });

  watch(data, (newCobradores) => {
    if (newCobradores) store.setCobradores(newCobradores);
  });

  const findCobradorById = (id: number): CobradorResponse | undefined => {
    return cobradores.value.find((cobrador) => cobrador.codCobrador === id);
  };

  return {
    cobradores,
    isLoading,
    getCobradores,
    findCobradorById,
  };
};
