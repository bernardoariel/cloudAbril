<template>
  <!-- Layout estilo WhatsApp, ocupa toda la pantalla disponible -->
  <div class="flex overflow-hidden" style="height: calc(100vh - 64px)">

    <!-- ═══════════════════════════════════════════
         Panel izquierdo: lista de conversaciones
    ═══════════════════════════════════════════ -->
    <div
      class="flex flex-col border-r border-base-300"
      style="width: 360px; min-width: 280px; background-color: #EDEDED"
    >
      <!-- Header verde WhatsApp -->
      <div
        class="flex items-center justify-between px-4 py-3"
        style="background-color: #075E54"
      >
        <div class="flex items-center gap-3">
          <div
            class="rounded-full w-10 h-10 flex items-center justify-center"
            style="background-color: #128C7E"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M21 16c0 1.1-.9 2-2 2H5l-4 4V5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v11z"/>
            </svg>
          </div>
          <span class="text-white font-semibold text-base">WhatsApp</span>
        </div>
        <button
          @click="loadConversations"
          class="btn btn-ghost btn-sm btn-circle text-white"
          title="Actualizar conversaciones"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
        </button>
      </div>

      <!-- Buscador -->
      <div class="px-3 py-2" style="background-color: #F6F6F6">
        <div class="flex items-center gap-2 rounded-full bg-white shadow-sm px-3 py-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"/>
          </svg>
          <input
            v-model="chatSearchQuery"
            type="text"
            placeholder="Buscar contacto..."
            class="grow bg-transparent text-sm outline-none"
          />
        </div>
      </div>

      <!-- Lista de conversaciones -->
      <div class="flex-1 overflow-y-auto bg-white">
        <!-- Skeletons durante carga -->
        <template v-if="loadingConversations">
          <div v-for="i in 6" :key="i" class="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
            <div class="flex-1">
              <div class="skeleton h-3 w-28 mb-2"></div>
              <div class="skeleton h-3 w-44"></div>
            </div>
          </div>
        </template>

        <!-- Sin resultados -->
        <div
          v-else-if="filteredConversations.length === 0"
          class="flex flex-col items-center justify-center h-40 gap-2"
          style="color: #aaa"
        >
          <span style="font-size: 36px; opacity: 0.35; filter: grayscale(1)">💬</span>
          <p class="text-sm">Sin conversaciones</p>
        </div>

        <!-- Lista -->
        <template v-else>
          <div
            v-for="conv in filteredConversations"
            :key="conv.phone"
            @click="selectConversation(conv)"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
            :class="selectedConversation?.phone === conv.phone ? 'bg-green-50' : ''"
          >
            <!-- Avatar con color consistente -->
            <div
              class="rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-base flex-shrink-0"
              :style="{ backgroundColor: getAvatarColor(conv.contact_name || conv.phone) }"
            >
              {{ getInitials(conv.contact_name || conv.phone) }}
            </div>

            <!-- Nombre + último mensaje + hora -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <span class="font-semibold text-sm text-gray-900 truncate">
                  {{ conv.contact_name || conv.phone }}
                </span>
                <span
                  class="text-xs flex-shrink-0 ml-2"
                  :style="isConversationUnread(conv) ? 'color:#25D366; font-weight:600' : 'color:#aaa'"
                >
                  {{ formatChatTime(conv.last_message_timestamp) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <p
                  class="text-xs truncate flex-1 min-w-0"
                  :class="isConversationUnread(conv) ? 'text-gray-900 font-semibold' : 'text-gray-500'"
                >
                  {{ conv.last_message_text || 'Sin mensajes' }}
                </p>
                <!-- Indicador de no leído -->
                <span
                  v-if="isConversationUnread(conv)"
                  class="flex-shrink-0 ml-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style="background-color: #25D366; font-size: 10px"
                >
                  ●
                </span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         Panel derecho: conversación activa
    ═══════════════════════════════════════════ -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Placeholder sin conversación -->
      <div
        v-if="!selectedConversation"
        class="flex-1 flex flex-col items-center justify-center gap-3"
        style="background-color: #F0F2F5"
      >
        <div style="font-size: 72px; opacity: 0.25; filter: grayscale(1)">💬</div>
        <p style="color: #aaa; font-size: 1rem; font-weight: 300">Seleccioná una conversación</p>
        <p style="color: #ccc; font-size: 0.8rem">Tus mensajes aparecerán aquí</p>
      </div>

      <template v-else>
        <!-- Header de la conversación seleccionada -->
        <div
          class="flex items-center gap-3 px-4 py-3 shadow-sm"
          style="background-color: #075E54"
        >
          <div
            class="rounded-full w-10 h-10 flex items-center justify-center text-white font-bold flex-shrink-0"
            :style="{ backgroundColor: getAvatarColor(selectedConversation.contact_name || selectedConversation.phone) }"
          >
            {{ getInitials(selectedConversation.contact_name || selectedConversation.phone) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white text-sm leading-tight truncate">
              {{ selectedConversation.contact_name || 'Sin nombre' }}
            </h3>
            <p class="text-green-200 text-xs">{{ selectedConversation.phone }}</p>
          </div>
          <button
            @click="loadConversationMessages()"
            class="btn btn-ghost btn-sm btn-circle text-white"
            title="Actualizar mensajes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>

        <!-- Área de mensajes con fondo WhatsApp -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-4 py-3"
          style="background-color: #E5DDD5"
        >
          <!-- Cargando -->
          <div v-if="loadingConversationMessages" class="flex justify-center items-center h-32">
            <span class="loading loading-dots loading-md" style="color: #128C7E"></span>
          </div>

          <!-- Sin mensajes -->
          <div v-else-if="conversationMessages.length === 0" class="flex justify-center items-center h-32">
            <div class="badge badge-ghost text-gray-400 py-3">Sin mensajes en esta conversación</div>
          </div>

          <!-- Mensajes usando DaisyUI chat bubbles -->
          <template v-else>
            <div
              v-for="msg in conversationMessages"
              :key="msg.id"
              :class="['chat', msg.status === 'sent' ? 'chat-end' : 'chat-start']"
            >
              <div
                class="chat-bubble shadow-sm text-sm"
                style="max-width: 75%; min-width: 80px;"
                :style="msg.status === 'sent'
                  ? 'background-color:#DCF8C6; color:#111; border-radius:12px 0 12px 12px;'
                  : 'background-color:#FFFFFF; color:#111; border-radius:0 12px 12px 12px;'"
              >
                <!-- Texto del mensaje -->
                <div v-if="msg.message_text" class="break-words leading-snug">
                  {{ msg.message_text }}
                </div>
                <!-- Archivo adjunto -->
                <div v-if="msg.media_id" class="flex items-center gap-1 text-gray-500 text-xs mt-1">
                  <span>📎</span>
                  <span class="capitalize">{{ msg.message_type }}</span>
                </div>
                <!-- Hora + doble tilde -->
                <div class="flex items-center justify-end gap-1 mt-1">
                  <span class="text-xs" style="color: #999">{{ formatChatTime(msg.timestamp) }}</span>
                  <span v-if="msg.status === 'sent'" class="text-xs" style="color:#4FC3F7">✓✓</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Avisos de feedback -->
        <div
          v-if="chatReplyError"
          class="px-4 py-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100"
        >
          {{ chatReplyError }}
        </div>
        <div
          v-if="chatReplySuccess"
          class="px-4 py-1.5 text-xs text-green-600 bg-green-50 border-t border-green-100"
        >
          Mensaje enviado ✓
        </div>

        <!-- Input de respuesta estilo WhatsApp -->
        <div class="flex items-end gap-2 px-3 py-3" style="background-color: #F0F2F5">
          <textarea
            v-model="chatReplyText"
            rows="1"
            placeholder="Escribe un mensaje"
            class="textarea flex-1 resize-none rounded-2xl text-sm leading-snug border-none bg-white shadow-sm"
            style="min-height: 42px; max-height: 120px; outline: none;"
            @keydown.ctrl.enter="sendChatReply"
            @input="autoResize"
            ref="chatReplyTextarea"
          ></textarea>
          <button
            @click="sendChatReply"
            :disabled="!chatReplyText.trim() || sendingChatReply"
            class="btn btn-circle border-none text-white flex-shrink-0 disabled:opacity-50"
            style="background-color: #075E54; width: 44px; height: 44px; min-height: 44px;"
          >
            <span v-if="sendingChatReply" class="loading loading-spinner loading-xs"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue';
import { wsWebhookApi, type IncomingMessage, type Conversation } from '@/api/wsWebhookApi';
import { useWhatsappNotifications } from '@/composables/useWhatsappNotifications';

const { markAsRead } = useWhatsappNotifications();

// ── LocalStorage: rastrear conversaciones leídas ──────────────────────────────
const SEEN_CONVOS_KEY = 'whatsapp_seen_conversations';

function getSeenConversations(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_CONVOS_KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Guarda el timestamp de la última vez que el usuario ABRIÓ explícitamente
 * esa conversación. No se llama al cargar la página, sólo al hacer click.
 */
function markConversationAsRead(phone: string, timestamp: number) {
  const seen = getSeenConversations();
  seen[phone] = timestamp;
  localStorage.setItem(SEEN_CONVOS_KEY, JSON.stringify(seen));
}

/**
 * Una conversación es "no leída" sólo si el último mensaje es más reciente
 * que el timestamp guardado. Si el usuario nunca entró, o entró antes del
 * último mensaje, aparece como no leída. No se resetea al recargar la página.
 */
function isConversationUnread(conv: Conversation): boolean {
  const seen = getSeenConversations();
  const lastSeen = seen[conv.phone] ?? 0;
  return conv.last_message_timestamp > lastSeen;
}

// ── State ─────────────────────────────────────────────────────────────────────
const conversations               = ref<Conversation[]>([]);
const loadingConversations        = ref(false);
const selectedConversation        = ref<Conversation | null>(null);
const conversationMessages        = ref<IncomingMessage[]>([]);
const loadingConversationMessages = ref(false);
const chatSearchQuery             = ref('');
const chatReplyText               = ref('');
const sendingChatReply            = ref(false);
const chatReplySuccess            = ref(false);
const chatReplyError              = ref('');
const chatReplyTextarea           = ref<HTMLTextAreaElement | null>(null);
const messagesContainer           = ref<HTMLDivElement | null>(null);

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredConversations = computed(() => {
  const q = chatSearchQuery.value.trim().toLowerCase();
  if (!q) return conversations.value;
  return conversations.value.filter(c =>
    c.contact_name?.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.last_message_text?.toLowerCase().includes(q)
  );
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(() => {
  loadConversations();
  // Marcar la campanita de notificaciones del navbar como leída al entrar
  markAsRead();
});

// ── Conversaciones ────────────────────────────────────────────────────────────
async function loadConversations() {
  loadingConversations.value = true;
  try {
    conversations.value = await wsWebhookApi.getConversations();
  } catch (err) {
    console.error('Error loading conversations:', err);
  } finally {
    loadingConversations.value = false;
  }
}

async function selectConversation(conv: Conversation) {
  selectedConversation.value = conv;
  // ⚑ Se marca como leída SÓLO cuando el usuario hace click, nunca al recargar
  markConversationAsRead(conv.phone, conv.last_message_timestamp);
  await loadConversationMessages();
}

// ── Mensajes ──────────────────────────────────────────────────────────────────
async function loadConversationMessages() {
  if (!selectedConversation.value) return;
  loadingConversationMessages.value = true;
  chatReplyError.value = '';
  chatReplySuccess.value = false;
  try {
    const msgs = await wsWebhookApi.getMessagesByPhone(selectedConversation.value.phone);
    conversationMessages.value = msgs.sort((a, b) => a.timestamp - b.timestamp);
    await nextTick();
    scrollToBottom();
  } catch {
    chatReplyError.value = 'Error al cargar mensajes';
  } finally {
    loadingConversationMessages.value = false;
  }
}

async function sendChatReply() {
  if (!selectedConversation.value || !chatReplyText.value.trim()) return;
  sendingChatReply.value = true;
  chatReplyError.value = '';
  chatReplySuccess.value = false;
  try {
    await wsWebhookApi.replyMessage(selectedConversation.value.phone, chatReplyText.value.trim());
    chatReplySuccess.value = true;
    chatReplyText.value = '';
    if (chatReplyTextarea.value) {
      chatReplyTextarea.value.style.height = 'auto';
    }
    setTimeout(async () => {
      await loadConversationMessages();
      chatReplySuccess.value = false;
    }, 800);
  } catch (err: any) {
    chatReplyError.value = err?.response?.data?.message || err.message || 'Error al enviar';
  } finally {
    sendingChatReply.value = false;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function autoResize(event: Event) {
  const el = event.target as HTMLTextAreaElement;
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Paleta de colores para avatares consistentes por contacto
const AVATAR_COLORS = [
  '#D9265E', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5',
  '#26A69A', '#66BB6A', '#FFA726', '#FF7043', '#8D6E63',
];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatChatTime(timestamp: number): string {
  if (!timestamp) return '';
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return date.toLocaleDateString('es-AR', { weekday: 'short' });
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}
</script>

<style scoped>
/* Scrollbar sutil */
.overflow-y-auto::-webkit-scrollbar        { width: 5px; }
.overflow-y-auto::-webkit-scrollbar-track  { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb  {
  background-color: rgba(0, 0, 0, 0.18);
  border-radius: 10px;
}
/* Textarea sin scroll hasta necesitar */
textarea { overflow-y: hidden; }
</style>
