import { useQuery } from '@tanstack/vue-query';
import { abrilApiData } from '@/api/abrilApiData';
import { storeToRefs } from 'pinia';
import { watch } from 'vue';
import type { FormaPago } from '../interfaces/forma-pago.interfaces';
import { useFormaPagoStore } from '../store/useFormaPagoStore';

const fetchFormaPago = async (): Promise<FormaPago[]> => {
  const { data } = await abrilApiData.get<FormaPago[]>('/forma-pago');
  return data;
};

export const useFormaPago = () => {
  const store = useFormaPagoStore();
  const { formaPago } = storeToRefs(store);

  const { isLoading, data } = useQuery({
    queryKey: ['forma-pagos'],
    queryFn: () => fetchFormaPago(),
    staleTime: 1000 * 30,
  });

  watch(data, (newFormaPagos) => {
    if (newFormaPagos) {
      store.setFormaPago(newFormaPagos);
    }
  });

  const findFormaPagoById = (CodForPago: string): FormaPago | undefined => {
    return formaPago.value.find((pago) => pago.CodForPago === CodForPago);
  };

  return {
    isLoading,
    formaPago,
    fetchFormaPago,
    findFormaPagoById,
  };
};
