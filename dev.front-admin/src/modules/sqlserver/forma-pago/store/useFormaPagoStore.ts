import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { FormaPago } from '../interfaces/forma-pago.interfaces';

export const useFormaPagoStore = defineStore('useFormaPagoStore', () => {
  const formaPago = ref<FormaPago[]>([]);

  return {
    //* Props

    //* Getters

    //* Actions
    formaPago,
    setFormaPago(newFormaPago: FormaPago[]) {
      formaPago.value = newFormaPago;
    },
  };
});
