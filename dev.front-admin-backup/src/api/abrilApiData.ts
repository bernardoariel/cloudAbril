import axios from 'axios';
import { refreshToken } from '@/modules/Auth/services/actions'; // La función para manejar la renovación del token
import { useAuthStore } from '@/store/useAuth'; // Importar el store
import { getActivePinia } from 'pinia'; // Importar para verificar si Pinia está activo

const getApiBaseUrl = () => {
  if (import.meta.env.MODE === 'production') {
    return import.meta.env.VITE_API_BASE_URL_PROD;
  }
  return import.meta.env.VITE_API_BASE_URL_LOCAL;
};

// Crear la instancia de Axios
const abrilApiData = axios.create({
  baseURL: getApiBaseUrl(),
});

// Inicialización del AuthStore desde localStorage
const initializeAuthStore = () => {
  const pinia = getActivePinia();
  if (!pinia) {
    console.warn('Pinia no está inicializado todavía.');
    return;
  }

  const authStore = useAuthStore();
  const storedEmail = localStorage.getItem('userEmail'); // Obtener el email del localStorage
  if (storedEmail) {
    authStore.setUser(storedEmail); // Setear el email en el store
  }
};

// Interceptor para agregar el token en las solicitudes
abrilApiData.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar las respuestas y errores
abrilApiData.interceptors.response.use(
  (response) => {
    // Si la respuesta contiene el email (ejemplo: durante el login), persistirlo en el localStorage y el store
    if (response.config.url?.includes('/auth/login') && response.data.email) {
      const pinia = getActivePinia();
      if (!pinia) {
        console.warn('Pinia no está inicializado todavía.');
        return response;
      }

      const authStore = useAuthStore();
      localStorage.setItem('userEmail', response.data.email); // Guardar el email en el localStorage
      authStore.setUser(response.data.email); // Guardar el email en el store
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const newTokens = await refreshToken(storedRefreshToken);

        localStorage.setItem('authToken', newTokens.accessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

        return axios(originalRequest);
      } catch (refreshError) {
        // Limpiar los datos de autenticación en caso de error
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail'); // Limpiar el email

        const pinia = getActivePinia();
        if (pinia) {
          const authStore = useAuthStore();
          authStore.clearUser(); // Limpiar el usuario del store
        }
        window.location.href = '/login'; // Redirigir al login
      }
    }
    return Promise.reject(error);
  },
);

export { abrilApiData, initializeAuthStore };
