import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"
import { useClienteContactoStore } from "@/stores/clienteContacto"
import { watch } from 'vue'

import type { ClienteContacto } from "@/interface/ClienteContacto"

/**
 * Función para obtener datos de contacto del cliente desde la API
 */
const fetchClienteContacto = async(codCliente: string): Promise<ClienteContacto> => {
  const { data } = await apiAbrilSql.get<ClienteContacto[]>(`/clientes-contactos/${codCliente}`)
  // Si data es un array, retorna solo el primero
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Composable para obtener y gestionar datos de contacto del cliente
 * Utiliza Pinia para almacenar en caché los resultados
 */
export const useClienteContacto = (codCliente: string) => {
  // Obtener instancia del store
  const clienteContactoStore = useClienteContactoStore();
  
  // Configuración de la consulta
  const query = useQuery({
    queryKey: ['cliente-contacto', codCliente],
    queryFn: () => fetchClienteContacto(codCliente),
    enabled: !!codCliente,
  });

  // Extraer los valores reactivos
  const { isLoading, data, error } = query;
  
  // Usar watch para reaccionar a cambios en los datos
  watch(data, (newData) => {
    if (newData) {
      clienteContactoStore.setContacto(newData);
    }
  });
  
  // Intentar usar datos del store si existen
  if (!data.value && codCliente) {
    // Verificar si hay datos en el store
    if (clienteContactoStore.contacto) {
      // Si hay datos en el store, refrescar solo en segundo plano
      query.refetch();
    }
  }
  
  return {
    clienteContacto: data,
    isLoading,
    error
  }
  
  return {
    clienteContacto: data,
    isLoading,
    error
  }
}

