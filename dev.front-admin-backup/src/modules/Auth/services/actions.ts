import { abrilApiData } from '@/api/abrilApiData';

export const login = async (email: string, password: string) => {
  try {
    // Hacer la petición al backend
    const response = await abrilApiData.post('/auth/login', { email, password });
    const { accessToken, refreshToken } = response.data;

    // Guardar los tokens en localStorage
    localStorage.setItem('authToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return { success: false, error: error.response?.data || 'Error desconocido' };
  }
};

export const refreshToken = async (refreshToken: string | null) => {
  if (!refreshToken) {
    throw new Error('No hay refresh token disponible');
  }

  try {
    const response = await abrilApiData.post('/auth/refresh', { refreshToken });
    const { accessToken } = response.data;

    // Retornamos el nuevo access token
    return { accessToken };
  } catch (error) {
    console.error('Error al refrescar el token:', error);
    throw error;
  }
};
export const ejecutarTarea = async () => {
  try {
    // Hacer una solicitud POST al endpoint
    const response = await abrilApiData.post('/tareas/ejecutar');

    // Devolver la respuesta
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error al ejecutar la tarea:', error);
    return { success: false, error: error.response?.data || 'Error desconocido' };
  }
};
