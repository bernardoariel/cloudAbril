import { defineStore } from 'pinia'
import type { ClienteContacto } from '@/interface/ClienteContacto'

export const useClienteContactoStore = defineStore('clienteContacto', {
  state: () => ({
    // El estado es directamente un objeto ClienteContacto
    contacto: null as ClienteContacto | null
  }),
  
  actions: {
    // Acción para actualizar el contacto
    setContacto(contacto: ClienteContacto | null) {
      this.contacto = contacto;
    }
  }
})