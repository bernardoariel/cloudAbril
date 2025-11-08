import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { FormaPagoPlanes } from '../interfaces/formaPagosPlanes.interfaces';

export const useFormaPagosPlanesStore = defineStore('useFormaPagosPlanesStore', () => {
  const formaPagoPlanes = ref<FormaPagoPlanes[]>([]);

  return {
    //* Props

    //* Getters

    //* Actions
    formaPagoPlanes,
    setFormaPagoPlanes(newFormaPagoPlanes: FormaPagoPlanes[]) {
      formaPagoPlanes.value = newFormaPagoPlanes;
    },
  };
});
