<template>
  <div class="min-h-screen bg-base-100 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <!-- WhatsApp Tabs -->
        <WhatsAppTabs class="mb-4" />
        
        <div class="flex items-center gap-3 mb-2">
          <div class="p-3 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-base-content">Mensajes Personalizados</h1>
            <p class="text-base-content/60">Envía WhatsApp a números específicos con mensajes personalizados</p>
          </div>
        </div>
      </div>

      <!-- Formulario Principal -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Panel de Envío -->
        <div class="lg:col-span-2 space-y-6">
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h2 class="card-title flex items-center gap-2 text-orange-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Configurar Envío
              </h2>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text font-semibold">Número de Teléfono</span>
                  <span class="label-text-alt text-info">Ej: 3704299434 (se formatea automáticamente)</span>
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
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
                  <span class="label-text-alt" :class="{ 'text-warning': messageLength > 1000, 'text-info': messageLength <= 1000 }">
                    {{ messageLength }}/1600 caracteres
                  </span>
                </label>
                <textarea
                  v-model="message"
                  placeholder="Escribí tu mensaje aquí..."
                  class="textarea textarea-bordered h-32 resize-none"
                  :class="{ 'textarea-warning': messageLength > 1000, 'textarea-error': messageLength > 1600 }"
                  maxlength="1600"
                ></textarea>
                <div v-if="messageLength > 1000" class="label">
                  <span class="label-text-alt text-warning">Los mensajes largos podrían dividirse en múltiples envíos</span>
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
                <button
                  @click="clearForm"
                  class="btn btn-ghost"
                  :disabled="isLoading"
                >
                  Limpiar
                </button>
                <button
                  @click="previewMessage"
                  class="btn btn-info"
                  :disabled="!canSend || isLoading"
                >
                  Vista Previa
                </button>
                <button
                  @click="sendMessage"
                  class="btn btn-success"
                  :disabled="!canSend || isLoading"
                  :class="{ 'loading': isLoading }"
                >
                  <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  {{ isLoading ? 'Enviando...' : 'Enviar WhatsApp' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel Lateral -->
        <div class="space-y-6">
          <!-- Vista Previa -->
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-info flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Vista Previa
              </h3>
              
              <div v-if="phoneNumber && message" class="mockup-phone">
                <div class="camera"></div>
                <div class="display">
                  <div class="artboard artboard-demo phone-1 bg-green-50">
                    <!-- WhatsApp Header Mockup -->
                    <div class="bg-green-600 text-white p-3 rounded-t-lg">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <div>
                          <div class="font-semibold text-sm">{{ formattedPhoneDisplay }}</div>
                          <div class="text-xs opacity-80">en línea</div>
                        </div>
                      </div>
                    </div>
                    <!-- Message Bubble -->
                    <div class="p-3 bg-white">
                      <div class="chat chat-end">
                        <div class="chat-bubble bg-green-500 text-white text-sm max-w-xs">
                          {{ message }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="text-center text-base-content/50 py-8">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Completa el formulario para ver la vista previa</p>
              </div>
            </div>
          </div>

          <!-- Historial Reciente -->
          <div class="card bg-base-200 shadow-lg">
            <div class="card-body">
              <h3 class="card-title text-purple-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Envíos Recientes
              </h3>
              
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div v-if="recentSends.length === 0" class="text-center text-base-content/50 py-4">
                  <p class="text-sm">No hay envíos recientes</p>
                </div>
                <div
                  v-for="send in recentSends"
                  :key="send.id"
                  class="p-2 bg-base-100 rounded-lg border border-base-300"
                >
                  <div class="flex justify-between items-start">
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate">{{ send.phone }}</div>
                      <div class="text-xs text-base-content/60 truncate">{{ send.message }}</div>
                      <div class="text-xs text-base-content/40">{{ formatDate(send.timestamp) }}</div>
                    </div>
                    <div class="ml-2">
                      <div class="badge badge-success badge-xs" v-if="send.status === 'sent'">Enviado</div>
                      <div class="badge badge-error badge-xs" v-else-if="send.status === 'error'">Error</div>
                      <div class="badge badge-warning badge-xs" v-else>Pendiente</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WhatsAppTabs from '@/components/WhatsAppTabs.vue';

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
  { id: 6, name: 'Seguimiento', text: 'Hola, quería hacer un seguimiento de...' }
]);

// Computed properties
const messageLength = computed(() => message.value.length);

const isValidPhone = computed(() => {
  if (!phoneNumber.value) return false;
  // Regex para validar formato argentino: +54 9 XXX XXX XXXX
  const phoneRegex = /^\+54\s9\s\d{3}\s\d{3}\s\d{4}$/;
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
    // +54 9 XXX XXX XXXX (total: 12 dígitos después del 54)
    if (value.length > 13) {
      value = value.substring(0, 13);
    }
    if (value.length >= 13) {
      phoneNumber.value = `+${value.substring(0, 2)} 9 ${value.substring(3, 6)} ${value.substring(6, 9)} ${value.substring(9, 13)}`;
    } else if (value.length >= 10) {
      phoneNumber.value = `+${value.substring(0, 2)} 9 ${value.substring(3, 6)} ${value.substring(6, 9)} ${value.substring(9)}`;
    } else if (value.length >= 7) {
      phoneNumber.value = `+${value.substring(0, 2)} 9 ${value.substring(3, 6)} ${value.substring(6)}`;
    } else if (value.length >= 4) {
      phoneNumber.value = `+${value.substring(0, 2)} 9 ${value.substring(3)}`;
    } else {
      phoneNumber.value = `+${value}`;
    }
  }
  // Si comienza con 9, asumir formato con 9 incluido
  else if (value.startsWith('9') && value.length === 11) {
    phoneNumber.value = `+54 ${value.substring(0, 1)} ${value.substring(1, 4)} ${value.substring(4, 7)} ${value.substring(7, 11)}`;
  }
  // Caso normal: número sin códigos (ej: 3704299434)
  else {
    if (value.length > 10) {
      value = value.substring(0, 10);
    }
    if (value.length === 10) {
      phoneNumber.value = `+54 9 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6, 10)}`;
    } else if (value.length >= 7) {
      phoneNumber.value = `+54 9 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6)}`;
    } else if (value.length >= 4) {
      phoneNumber.value = `+54 9 ${value.substring(0, 3)} ${value.substring(3)}`;
    } else if (value.length >= 1) {
      phoneNumber.value = `+54 9 ${value}`;
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
    // Simular envío (aquí integrarías con tu API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Agregar al historial
    recentSends.value.unshift({
      id: Date.now(),
      phone: phoneNumber.value,
      message: message.value.substring(0, 50) + (message.value.length > 50 ? '...' : ''),
      timestamp: new Date(),
      status: 'sent'
    });
    
    // Limpiar formulario
    clearForm();
    
    // Mostrar éxito
    alert('Mensaje enviado exitosamente');
    
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
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
    minute: '2-digit'
  }).format(date);
};

// Lifecycle
onMounted(() => {
  // Cargar historial desde localStorage si existe
  const stored = localStorage.getItem('whatsapp-recent-sends');
  if (stored) {
    recentSends.value = JSON.parse(stored).map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
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

.input[type="tel"]:focus {
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