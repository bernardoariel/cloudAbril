import { useQuery } from '@tanstack/vue-query';
import { abrilApiData } from '@/api/abrilApiData';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';

import type { FormaPagoPlanes } from '../interfaces/formaPagosPlanes.interfaces';
import { useFormaPagosPlanesStore } from '../store/useFormaPagosPlanesStore';

const fetchFormaPagoPlanes = async (): Promise<FormaPagoPlanes[]> => {
  const { data } = await abrilApiData.get<FormaPagoPlanes[]>('/forma-pago-planes');
  return data;
};

export const useFormaPagoPlanes = () => {
  const store = useFormaPagosPlanesStore();
  const { formaPagoPlanes } = storeToRefs(store);

  const { isLoading, data } = useQuery({
    queryKey: ['forma-pago-planes'],
    queryFn: () => fetchFormaPagoPlanes(),
    staleTime: 1000 * 30,
  });

  watch(data, (newFormaPagoPlanes) => {
    if (newFormaPagoPlanes) {
      store.setFormaPagoPlanes(newFormaPagoPlanes);
    }
  });

  const findFormaPagoPlanesById = (id: number): FormaPagoPlanes | undefined => {
    return formaPagoPlanes.value.find((marca) => formaPagoPlanes.CodMarca === id);
  };

  return {
    isLoading,
    formaPagoPlanes,
    fetchFormaPagoPlanes,
    findFormaPagoPlanesById,
  };
};
