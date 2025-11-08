import { useQuery } from '@tanstack/vue-query';
import { abrilApiData } from '@/api/abrilApiData';
import { useMarcasStore } from '../store/useMarcasStore';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import type { MarcasResponse } from '../interfaces/marcas.interfaces';

const fetchMarcas = async (): Promise<MarcasResponse[]> => {
  const { data } = await abrilApiData.get<MarcasResponse[]>('/prod-marca');
  return data;
};

export const useMarcas = () => {
  const store = useMarcasStore();
  const { marcas } = storeToRefs(store);

  const { isLoading, data } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => fetchMarcas(),
    staleTime: 1000 * 30,
  });

  watch(data, (newMarcas) => {
    if (newMarcas) {
      store.setMarcas(newMarcas);
    }
  });

  const findMarcasById = (id: number): MarcasResponse | undefined => {
    return marcas.value.find((marca) => marca.CodMarca === id);
  };

  return {
    isLoading,
    marcas,
    fetchMarcas,
    findMarcasById,
  };
};
