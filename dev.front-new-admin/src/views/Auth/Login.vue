<template>
  <FullScreenLayout>
    <div class="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div
        class="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900"
      >
        <div class="flex flex-col flex-1 lg:w-1/2 w-full">
          <div class="w-full max-w-md pt-10 mx-auto">
            <router-link
              to="/"
              class="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                class="stroke-current"
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M12.7083 5L7.5 10.2083L12.7083 15.4167"
                  stroke=""
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              Volver al dashboard
            </router-link>
          </div>
          <div class="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
            <div>
              <div class="mb-5 sm:mb-8">
                <h1
                  class="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md"
                >
                  Iniciar sesión
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  ¡Ingrese su código de cliente y número de documento para iniciar sesión!
                </p>
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="space-y-5">
                  <!-- Mensaje de error -->
                  <div v-if="errorMessage" class="p-3 text-sm text-white bg-red-500 rounded-md">
                    {{ errorMessage }}
                  </div>

                  <!-- Código de Cliente -->
                  <div>
                    <label
                      for="codCliente"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      Código de Cliente<span class="text-error-500">*</span>
                    </label>
                    <input
                      v-model="codCliente"
                      type="text"
                      id="codCliente"
                      name="codCliente"
                      placeholder="Ej: 0101001"
                      class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    />
                  </div>

                  <!-- Número de Documento -->
                  <div>
                    <label
                      for="nroDoc"
                      class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                    >
                      Número de Documento<span class="text-error-500">*</span>
                    </label>
                    <div class="relative">
                      <input
                        v-model="nroDoc"
                        type="text"
                        id="nroDoc"
                        placeholder="Ingrese su número de documento"
                        class="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      :disabled="isLoading"
                      class="dark:bg-brand-500 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-gray-900 px-4.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 dark:hover:bg-brand-600"
                    >
                      <svg v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ isLoading ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Imagen lateral -->
        <div class="items-center justify-center hidden w-1/2 h-full lg:flex">
          <div class="relative w-full max-w-full h-full bg-cover bg-no-repeat">
            <img
              src="@/assets/images/signin-bg.jpg"
              alt="sign-in bg"
              class="object-cover w-full h-full"
            />
            <div
              class="absolute top-0 left-0 flex flex-col items-center justify-center w-full h-full px-20 text-center bg-gray-900/60"
            >
              <div class="mb-5">
                <h2 class="mb-2 text-2xl font-bold text-white md:text-title-lg">
                  Bienvenido a Abril
                </h2>
                <p class="text-sm text-gray-100 md:text-base">
                  Su plataforma para gestionar sus créditos y pagos de manera fácil y segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </FullScreenLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login, isLoading: authLoading, error: authError } = useAuth()

// Estado del formulario
const codCliente = ref('')
const nroDoc = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

// Manejar envío del formulario
const handleSubmit = async () => {
  // Validación básica
  if (!codCliente.value || !nroDoc.value) {
    errorMessage.value = 'Por favor, ingrese todos los campos requeridos.'
    return
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    // Intentar login usando el composable
    const result = await login(codCliente.value, nroDoc.value)

    if (result && result.success) {
      // Redireccionar al dashboard o página principal
      router.push('/dashcliente')
    } else {
      errorMessage.value = result?.error || 'Error al iniciar sesión. Verifique sus credenciales.'
    }
  } catch (error: any) {
    console.error('Error en el proceso de login:', error)
    errorMessage.value = 'Ocurrió un error inesperado. Intente nuevamente.'
  } finally {
    isLoading.value = false
  }
}
</script>
