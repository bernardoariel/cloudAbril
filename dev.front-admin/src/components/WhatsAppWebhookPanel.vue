<template>
  <div class="card bg-base-100 shadow-xl mb-96">
    <div class="card-body p-4 mb-4">
      <div class="flex items-center justify-between mb-3">
        <h3 class="card-title text-base">📡 Webhook WhatsApp</h3>
        <router-link to="/whatsapp/webhook" class="btn btn-ghost btn-xs">
          Ver todo →
        </router-link>
      </div>

      <!-- Tabs pequeños -->
      <div class="tabs tabs-boxed tabs-sm mb-3">
        <a 
          class="tab tab-sm" 
          :class="{ 'tab-active': activeTab === 'received' }"
          @click="activeTab = 'received'"
        >
          📥 Recibidos ({{ messages.length }})
        </a>
        <a 
          class="tab tab-sm" 
          :class="{ 'tab-active': activeTab === 'events' }"
          @click="activeTab = 'events'"
        >
          📤 Enviados ({{ events.length }})
        </a>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-4">
        <span class="loading loading-spinner loading-sm"></span>
      </div>

      <!-- Tab: Mensajes Recibidos -->
      <div v-else-if="activeTab === 'received'">
        <div v-if="messages.length === 0" class="text-center text-gray-500 py-4 text-sm">
          No hay mensajes recibidos hoy
        </div>
        <div v-else class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="msg in messages.slice(0, 5)" 
            :key="msg.id"
            class="bg-base-200 p-2 rounded-lg text-sm"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg">{{ getTypeIcon(msg.message_type) }}</span>
              <span class="font-semibold truncate">{{ msg.contact_name || 'Desconocido' }}</span>
            </div>
            <div class="text-xs text-gray-500 mb-1">
              {{ msg.phone_from }} · {{ formatTime(msg.timestamp) }}
            </div>
            <div v-if="msg.message_text" class="text-gray-700 truncate">
              {{ msg.message_text }}
            </div>
            <div v-else class="text-gray-400 italic">
              {{ msg.message_type === 'image' ? '📷 Imagen' : 
                 msg.message_type === 'audio' ? '🎤 Audio' : 
                 msg.message_type === 'video' ? '🎥 Video' : 
                 msg.message_type === 'document' ? '📄 Documento' : 'Media' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Eventos (Estados de envío) -->
      <div v-else-if="activeTab === 'events'">
        <div v-if="events.length === 0" class="text-center text-gray-500 py-4 text-sm">
          No hay eventos de envío hoy
        </div>
        <div v-else class="space-y-2 max-h-64 overflow-y-auto">
          <div 
            v-for="evt in events.slice(0, 5)" 
            :key="evt.id"
            class="bg-base-200 p-2 rounded-lg text-sm"
          >
            <div class="flex items-center gap-2">
              <span class="text-lg">{{ getStatusIcon(evt.message_status) }}</span>
              <span 
                class="badge badge-sm"
                :class="getStatusBadge(evt.message_status)"
              >
                {{ evt.message_status || evt.event_type }}
              </span>
              <span class="text-xs text-gray-500">
                {{ evt.timestamp ? formatTime(evt.timestamp) : formatDate(evt.created_at) }}
              </span>
            </div>
            <div v-if="evt.phone_number" class="text-xs text-gray-600 mt-1">
              📱 {{ evt.phone_number }}
            </div>
          </div>
        </div>
      </div>

      <!-- Resumen rápido -->
      <div v-if="!loading" class="mt-3 pt-3 border-t border-base-300">
        <div class="grid grid-cols-2 gap-2 text-center text-xs">
          <div class="bg-blue-50 p-2 rounded">
            <div class="font-bold text-blue-600">{{ stats?.totalMessages || 0 }}</div>
            <div class="text-gray-500">Recibidos Total</div>
          </div>
          <div class="bg-green-50 p-2 rounded">
            <div class="font-bold text-green-600">{{ stats?.totalEvents || 0 }}</div>
            <div class="text-gray-500">Eventos Total</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <br>
  <br>
  <br>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { wsWebhookApi, type IncomingMessage, type WebhookEvent, type WebhookStats } from '@/api/wsWebhookApi';

const activeTab = ref<'received' | 'events'>('received');
const loading = ref(true);
const messages = ref<IncomingMessage[]>([]);
const events = ref<WebhookEvent[]>([]);
const stats = ref<WebhookStats | null>(null);

onMounted(async () => {
  await loadData();
});

async function loadData() {
  loading.value = true;
  try {
    // Obtener fecha de hoy en formato DD/MM/YYYY
    const today = new Date();
    const todayStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    // Cargar mensajes y eventos de hoy en paralelo
    const [messagesRes, eventsRes, statsRes] = await Promise.all([
      wsWebhookApi.getIncomingMessages(1, 10, todayStr, todayStr),
      wsWebhookApi.getWebhookEvents(1, 10, todayStr, todayStr),
      wsWebhookApi.getStats(),
    ]);

    messages.value = messagesRes.data;
    events.value = eventsRes.data;
    stats.value = statsRes;
  } catch (err) {
    console.error('Error loading webhook data:', err);
  } finally {
    loading.value = false;
  }
}

function formatTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('es-AR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    text: '💬',
    image: '📷',
    audio: '🎤',
    video: '🎥',
    document: '📄',
    location: '📍',
    contacts: '👥',
  };
  return icons[type] || '📱';
}

function getStatusIcon(status?: string): string {
  const icons: Record<string, string> = {
    sent: '📤',
    delivered: '✅',
    read: '👁️',
    failed: '❌',
  };
  return icons[status || ''] || '📋';
}

function getStatusBadge(status?: string): string {
  const badges: Record<string, string> = {
    sent: 'badge-info',
    delivered: 'badge-success',
    read: 'badge-primary',
    failed: 'badge-error',
  };
  return badges[status || ''] || 'badge-ghost';
}

// Exponer método para refrescar desde padre
defineExpose({ loadData });
</script>
