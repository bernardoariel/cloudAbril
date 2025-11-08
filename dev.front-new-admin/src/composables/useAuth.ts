import { apiAbrilSql } from "@/api/apiAbrilSql";
import { useQuery } from "@tanstack/vue-query";
import { useAuthStore } from "@/stores/auth";
import { computed, ref } from "vue";

// Tipo para la respuesta del login
interface LoginResponse {
  token?: string;
  user?: any;
  [key: string]: any;
}

// Función que realiza la petición de login
const fetchLogin = async (codCliente: string, nroDoc: string): Promise<LoginResponse> => {
  const { data } = await apiAbrilSql.post<LoginResponse>('/login', {
    codCliente,
    nroDoc
  });
  return data;
};

export const useAuth = () => {
  const authStore = useAuthStore();

  // Referencias para los parámetros de login
  const loginParams = ref({
    codCliente: '',
    nroDoc: ''
  });

  // Query para login
  const {
    data: loginData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['login', loginParams.value.codCliente, loginParams.value.nroDoc],
    queryFn: () => fetchLogin(loginParams.value.codCliente, loginParams.value.nroDoc),
    enabled: false, // No ejecutar automáticamente, solo cuando llamemos a login()
  });

  // Función wrapper para el login
  const login = async (codCliente: string, nroDoc: string) => {
    // Actualizar parámetros
    loginParams.value = { codCliente, nroDoc };
    console.log('Intentando login con:', codCliente, nroDoc);

    try {
      // Forzar la ejecución de la query
      const result = await refetch();
      console.log('Respuesta del servidor (JSON):', JSON.stringify(result.data, null, 2));
      if (result.data) {
        console.log('Estructura de la respuesta:', Object.keys(result.data));
      }

      if (result.data) {
        // Extraer datos del usuario
        const userData = result.data.user || result.data;
        console.log('Datos del usuario:', userData);

        // Verificar si authStore es accesible
        console.log('Estado del store antes:', authStore.authState);

        try {
          // Procesar los datos para evitar duplicidad
          const accessToken = result.data.token || result.data.access_token || null;

          // Extraer datos del usuario eliminando tokens duplicados
          const cleanUserData = { ...userData };

          // Eliminar campos duplicados que ya tenemos a nivel superior
          if (cleanUserData.access_token) delete cleanUserData.access_token;
          if (cleanUserData.token) delete cleanUserData.token;

          // Si existe cliente y contiene los mismos datos, usar solo los datos sin duplicar
          if (cleanUserData.cliente) {
            // Extraer datos del cliente
            const { codCliente: clienteCod, nroDoc: clienteDoc, ...otrosCliente } = cleanUserData.cliente;

            // Conservar solo datos únicos del cliente
            delete cleanUserData.cliente;

            // Usar explícitamente los valores proporcionados al login
            cleanUserData.codCliente = codCliente;
            cleanUserData.nroDoc = nroDoc;

            // Añadir otros datos del cliente sin duplicar
            Object.assign(cleanUserData, otrosCliente);
          } else {
            // Si no hay cliente, asegurar que tenemos codCliente y nroDoc
            cleanUserData.codCliente = codCliente;
            cleanUserData.nroDoc = nroDoc;
          }

          console.log('Datos de usuario limpios:', cleanUserData);

          // Guardar en el store cuando la petición es exitosa usando el setter
          authStore.setAuthState({
            isAuthenticated: true,
            accessToken,
            userData: cleanUserData
          });

          console.log('Estado del store después:', authStore.authState);
        } catch (storeError) {
          console.error('Error al actualizar el store:', storeError);
        }

        // Guardar en localStorage
        localStorage.setItem('authState', JSON.stringify(authStore.authState));
        console.log('Datos guardados en localStorage');

        return { success: true, data: result.data };
      }

      return { success: false, error: "No se recibieron datos del servidor" };
    } catch (err: any) {
      console.error('Error de login:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  };

  return {
    login,
    isLoading,
    error,
    loginData,
    // Exportamos los getters del store para acceder al estado
    isAuthenticated: computed(() => authStore.isAuthenticated),
    userData: computed(() => authStore.userData),
    user: computed(() => authStore.userData), // Mantener compatibilidad con el código existente
    // También exportamos la función logout del store
    logout: authStore.logout
  };
};
