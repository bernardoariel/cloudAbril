<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <!-- Columna Principal (ocupa 2 de 3 columnas en LG) -->
      <div class="lg:col-span-2 card bg-base-100 shadow-xl">
        <div class="card-body">
          <WhatsAppTabs class="mb-4" />
          <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 class="card-title">Mensajes Personalizados</h2>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Número de Teléfono</span>
              <span class="label-text-alt text-info"
                >Ej: 3704299434 (formato: +54 XXX XXX XXXX)</span
              >
            </label>
            <div class="relative">
              <input
                type="tel"
                v-model="phoneNumber"
                placeholder="3704299434"
                class="input input-bordered w-full pl-12"
                :class="{ 'input-error': !isValidPhone && phoneNumber.length > 0 }"
                @input="formatPhoneNumber"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
            </div>
            <div v-if="!isValidPhone && phoneNumber.length > 0" class="label">
              <span class="label-text-alt text-error">Formato de teléfono inválido</span>
            </div>
          </div>

          <!-- Mensaje -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Mensaje</span>
              <span
                class="label-text-alt"
                :class="{
                  'text-warning': messageLength > 1000,
                  'text-info': messageLength <= 1000,
                }"
              >
                {{ messageLength }}/1600 caracteres
              </span>
            </label>
            <textarea
              v-model="message"
              placeholder="Escribí tu mensaje aquí..."
              class="textarea textarea-bordered h-32 resize-none"
              :class="{
                'textarea-warning': messageLength > 1000,
                'textarea-error': messageLength > 1600,
              }"
              maxlength="1600"
            ></textarea>
            <div v-if="messageLength > 1000" class="label">
              <span class="label-text-alt text-warning"
                >Los mensajes largos podrían dividirse en múltiples envíos</span
              >
            </div>
          </div>

          <!-- Plantillas Rápidas -->
          <div class="form-control">
            <label class="label">
              <span class="label-text font-semibold">Plantillas Rápidas</span>
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                v-for="template in messageTemplates"
                :key="template.id"
                @click="selectTemplate(template.text)"
                class="btn btn-outline btn-sm text-left justify-start"
              >
                <span class="truncate">{{ template.name }}</span>
              </button>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="card-actions justify-end gap-3 mt-6">
            <button @click="clearForm" class="btn btn-ghost" :disabled="isLoading">Limpiar</button>
            
            <button
              @click="sendMessage"
              class="btn btn-success"
              :disabled="!canSend || isLoading"
              :class="{ loading: isLoading }"
            >
              <svg
                v-if="!isLoading"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              {{ isLoading ? 'Enviando...' : 'Enviar WhatsApp' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Columna del Detalle (ocupa 1 de 3 columnas en LG) -->
      <div class="lg:col-span-1 space-y-4">
        <!-- Vista Previa -->
        <div class="card bg-base-200 shadow-lg">
          <div class="card-body">

           <WhatsappPreview
              :title="formattedPhoneDisplay"
              subtitle="en línea"
              :message="message"
              :is-empty="!(phoneNumber && message)"
              empty-text="Completa el formulario para ver la vista previa"
            />

            
          </div>
        </div>

        <!-- Historial Reciente -->
        <!-- <div class="card bg-base-200 shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-purple-600 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Envíos Recientes
            </h3>

            <div class="space-y-2 max-h-48 overflow-y-auto">
              <div v-if="recentSends.length === 0" class="text-center text-base-content/50 py-4">
                <p class="text-sm">No hay envíos recientes</p>
              </div>
              
            </div>
          </div>
        </div> -->
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación -->
  <div v-if="showPreview" class="modal modal-open">
    <div class="modal-box max-w-md">
      <h3 class="font-bold text-lg mb-4">Confirmar Envío</h3>

      <div class="space-y-4">
        <div>
          <label class="text-sm font-semibold text-base-content/70">Número:</label>
          <p class="text-lg">{{ formattedPhoneDisplay }}</p>
        </div>

        <div>
          <label class="text-sm font-semibold text-base-content/70">Mensaje:</label>
          <div class="bg-base-200 p-3 rounded-lg">
            <p class="whitespace-pre-wrap text-sm">{{ message }}</p>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button @click="showPreview = false" class="btn btn-ghost">Cancelar</button>
        <button @click="confirmSend" class="btn btn-success">Confirmar Envío</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WhatsAppTabs from '@/components/WhatsAppTabs.vue';
import { whatsappService } from '@/services/whatsappService';
import WhatsappPreview from '@/components/WhatsappPreview.vue';

// Estados reactivos
const phoneNumber = ref('');
const message = ref('');
const isLoading = ref(false);
const showPreview = ref(false);
const recentSends = ref<any[]>([]);

// Plantillas de mensaje
const messageTemplates = ref([
  { id: 1, name: 'Saludo', text: '¡Hola! ¿Cómo estás? Espero que tengas un excelente día.' },
  { id: 2, name: 'Consulta', text: 'Hola, quería consultarte sobre...' },
  { id: 3, name: 'Recordatorio', text: 'Te recordamos que...' },
  { id: 4, name: 'Agradecimiento', text: '¡Muchas gracias por tu tiempo y atención!' },
  { id: 5, name: 'Información', text: 'Te compartimos la siguiente información:' },
  { id: 6, name: 'Seguimiento', text: 'Hola, quería hacer un seguimiento de...' },
]);

// Computed properties
const messageLength = computed(() => message.value.length);

const isValidPhone = computed(() => {
  if (!phoneNumber.value) return false;
  // Regex para validar formato argentino: +54 XXX XXX XXXX
  const phoneRegex = /^\+54\s\d{3}\s\d{3}\s\d{4}$/;
  return phoneRegex.test(phoneNumber.value);
});

const formattedPhoneDisplay = computed(() => {
  return phoneNumber.value || 'Sin número';
});

const canSend = computed(() => {
  return isValidPhone.value && message.value.trim().length > 0;
});

// Métodos
const formatPhoneNumber = () => {
  let value = phoneNumber.value.replace(/\D/g, '');

  // Si está vacío, mostrar el formato inicial
  if (!value) {
    phoneNumber.value = '';
    return;
  }

  // Si ya comienza con 54, asumir que es formato completo
  if (value.startsWith('54')) {
    // +54 XXX XXX XXXX (total: 12 dígitos después del 54)
    if (value.length > 12) {
      value = value.substring(0, 12);
    }
    if (value.length >= 12) {
      phoneNumber.value = `+${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(
        5,
        8,
      )} ${value.substring(8, 12)}`;
    } else if (value.length >= 9) {
      phoneNumber.value = `+${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(
        5,
        8,
      )} ${value.substring(8)}`;
    } else if (value.length >= 6) {
      phoneNumber.value = `+${value.substring(0, 2)} ${value.substring(2, 5)} ${value.substring(
        5,
      )}`;
    } else if (value.length >= 3) {
      phoneNumber.value = `+${value.substring(0, 2)} ${value.substring(2)}`;
    } else {
      phoneNumber.value = `+${value}`;
    }
  }
  // Caso normal: número sin códigos (ej: 3704299434)
  else {
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    if (value.length === 10) {
      phoneNumber.value = `+54 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(
        6,
        10,
      )}`;
    } else if (value.length >= 7) {
      phoneNumber.value = `+54 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(
        6,
      )}`;
    } else if (value.length >= 4) {
      phoneNumber.value = `+54 ${value.substring(0, 3)} ${value.substring(3)}`;
    } else if (value.length >= 1) {
      phoneNumber.value = `+54 ${value}`;
    }
  }
};

const selectTemplate = (templateText: string) => {
  message.value = templateText;
};

const clearForm = () => {
  phoneNumber.value = '';
  message.value = '';
};

const previewMessage = () => {
  if (canSend.value) {
    showPreview.value = true;
  }
};

const confirmSend = async () => {
  showPreview.value = false;
  await sendMessage();
};

const sendMessage = async () => {
  if (!canSend.value) return;

  isLoading.value = true;
  try {
    // Extraer solo el número sin formato para el endpoint
    const cleanPhone = phoneNumber.value.replace(/\D/g, '');

    // Llamar al endpoint de WhatsApp Hola Abril
    await whatsappService.sendHolaAbril(cleanPhone);

    // Agregar al historial
    recentSends.value.unshift({
      id: Date.now(),
      phone: phoneNumber.value,
      message: message.value.substring(0, 50) + (message.value.length > 50 ? '...' : ''),
      timestamp: new Date(),
      status: 'sent',
    });

    // Guardar en localStorage
    localStorage.setItem('whatsapp-recent-sends', JSON.stringify(recentSends.value));

    // Limpiar formulario
    clearForm();

    // Mostrar éxito
    alert('Mensaje enviado exitosamente');
  } catch (error) {
    console.error('Error al enviar mensaje:', error);

    // Agregar al historial con estado de error
    recentSends.value.unshift({
      id: Date.now(),
      phone: phoneNumber.value,
      message: message.value.substring(0, 50) + (message.value.length > 50 ? '...' : ''),
      timestamp: new Date(),
      status: 'error',
    });

    alert('Error al enviar mensaje');
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Lifecycle
onMounted(() => {
  // Cargar historial desde localStorage si existe
  const stored = localStorage.getItem('whatsapp-recent-sends');
  if (stored) {
    recentSends.value = JSON.parse(stored).map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp),
    }));
  }
});
</script>

<style scoped>
.mockup-phone .display .artboard {
  background: #f0fdf4;
}

.chat-bubble {
  position: relative;
  padding: 0.75rem;
  border-radius: 1rem;
  max-width: 200px;
  word-wrap: break-word;
}

.chat-end .chat-bubble {
  background-color: #22c55e;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.mockup-phone .camera {
  background: #1f2937;
}

.input[type='tel']:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.textarea:focus {
  outline: none;
  border-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}
</style>
