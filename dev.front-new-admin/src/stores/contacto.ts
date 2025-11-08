import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ClienteContacto } from '@/interface/ClienteContacto'

export interface ContactoState {
  contactos: Record<string, ClienteContacto | null>;
  loadingState: Record<string, boolean>;
}

export const useContactoStore = defineStore('contacto', () => {
  // Estado para almacenar los datos de contacto por código de cliente
  const contactoState = ref<ContactoState>({
    contactos: {},
    loadingState: {}
  });

  // Getter para un contacto específico
  const getContacto = (codCliente: string) => computed(() =>
    contactoState.value.contactos[codCliente] || null
  );

  // Getter para el estado de carga
  const isLoading = (codCliente: string) => computed(() =>
    contactoState.value.loadingState[codCliente] || false
  );

  // Setter para actualizar un contacto
  function setContacto(codCliente: string, contacto: ClienteContacto | null) {
    contactoState.value.contactos[codCliente] = contacto;
  }

  // Setter para actualizar el estado de carga
  function setLoading(codCliente: string, loading: boolean) {
    contactoState.value.loadingState[codCliente] = loading;
  }

  return {
    contactoState,
    getContacto,
    isLoading,
    setContacto,
    setLoading
  }
})
