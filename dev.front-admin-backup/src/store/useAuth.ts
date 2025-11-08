import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Estado reactivo inicializado desde localStorage
  const user = ref<null | string>(localStorage.getItem('userEmail'));

  // Métodos
  const setUser = (newUser: string) => {
    user.value = newUser;
    localStorage.setItem('userEmail', newUser); // Guardar en localStorage
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem('userEmail'); // Eliminar del localStorage
  };

  // Exponer estado y métodos
  return {
    user,
    setUser,
    clearUser,
  };
});
