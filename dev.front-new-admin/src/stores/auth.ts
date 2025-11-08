import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Interfaces para la estructura de datos de autenticación
export interface UserData {
  codCliente?: string;
  nroDoc?: string;
  // Otros campos que puedan venir del usuario
  [key: string]: unknown;
}

export interface AuthState {
  // Indica si el usuario está autenticado
  isAuthenticated: boolean;
  // Token de acceso para la API
  accessToken: string | null;
  // Datos del usuario (nombre, email, etc)
  userData: UserData | null;
}

export const useAuthStore = defineStore('auth', () => {
  // Un solo estado de autenticación
  const authState = ref<AuthState>({
    isAuthenticated: false,
    accessToken: null,
    userData: null
  })

  // Getters computados
  const isAuthenticated = computed(() => authState.value.isAuthenticated)
  const userData = computed(() => authState.value.userData)
  const codCliente = computed(() => authState.value.userData?.codCliente || '')

  // Exponer setters para facilitar la actualización del estado
  function setAuthState(newState: AuthState) {
    console.log('Actualizando estado de autenticación:', newState);
    authState.value = newState;
  }

  function logout() {
    // Resetear el estado
    authState.value = {
      isAuthenticated: false,
      accessToken: null,
      userData: null
    }

    // Eliminar datos de localStorage
    localStorage.removeItem('authState')
  }

  function initialize() {
    // Cargar datos del usuario desde localStorage al iniciar la aplicación
    const storedState = localStorage.getItem('authState')
    if (storedState) {
      try {
        const parsedState = JSON.parse(storedState)
        authState.value = parsedState
      } catch (e) {
        console.error('Error al parsear datos de autenticación:', e)
        logout() // En caso de error, limpiar datos
      }
    }
  }

  // Inicializar al cargar el store
  initialize()

  return {
    authState,
    isAuthenticated,
    userData: computed(() => authState.value.userData),
    codCliente,
    logout,
    setAuthState
  }
})
