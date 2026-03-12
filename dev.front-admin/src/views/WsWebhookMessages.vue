<template>
  <!--
    h-16 = NavHeader (64px) + btm-nav h-16 footer (64px) = 128px total
    Usamos la altura explícita para no depender de la cadena de height:100% a través de RouterView
  -->
  <div class="flex overflow-hidden" style="height: calc(100vh - 128px)">

    <!-- ═══════════════════════════════════════════
         Panel izquierdo: lista de conversaciones
    ═══════════════════════════════════════════ -->
    <div
      class="flex flex-col border-r border-base-300 flex-shrink-0"
      style="width: 360px; min-width: 280px; background-color: #EDEDED"
    >
      <!-- Header verde WhatsApp -->
      <div
        class="flex items-center justify-between px-4 py-3 flex-shrink-0"
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
          <span class="text-white font-semibold text-base">Mensajes WhatsApp</span>
        </div>
        <div class="flex items-center gap-1">
          <!-- Indicador de auto-refresh -->
          <span v-if="convosRefetching" class="loading loading-spinner loading-xs text-green-300"></span>
          <button
            @click="refreshConversations"
            class="btn btn-ghost btn-sm btn-circle text-white"
            title="Actualizar conversaciones"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Buscador -->
      <div class="px-3 py-2 flex-shrink-0" style="background-color: #F6F6F6">
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

      <!-- Lista de conversaciones — scrolleable independiente -->
      <div class="flex-1 overflow-y-auto bg-white">
        <!-- Skeletons durante carga inicial -->
        <template v-if="convosLoading">
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
            @contextmenu.prevent="openContextMenu($event, 'conversation', conv)"
            class="flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50"
            :class="selectedPhone === conv.phone ? 'bg-green-50' : ''"
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
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Placeholder sin conversación -->
      <div
        v-if="!selectedPhone"
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
          class="flex items-center gap-3 px-4 py-3 shadow-sm flex-shrink-0"
          style="background-color: #075E54"
        >
          <div
            class="rounded-full w-10 h-10 flex items-center justify-center text-white font-bold flex-shrink-0"
            :style="{ backgroundColor: getAvatarColor(selectedConvData?.contact_name || selectedPhone) }"
          >
            {{ getInitials(selectedConvData?.contact_name || selectedPhone) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-white text-sm leading-tight truncate">
              {{ selectedConvData?.contact_name || 'Sin nombre' }}
            </h3>
            <p class="text-green-200 text-xs">{{ selectedPhone }}</p>
          </div>
          <div class="flex items-center gap-1">
            <span v-if="msgsRefetching" class="loading loading-spinner loading-xs text-green-300"></span>
            <button
              @click="refreshMessages"
              class="btn btn-ghost btn-sm btn-circle text-white"
              title="Actualizar mensajes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Área de mensajes scrolleable — ocupa todo el espacio disponible entre header e input -->
        <div
          ref="messagesContainer"
          class="flex-1 overflow-y-auto px-4 py-3"
          style="background-color: #E5DDD5"
        >
          <!-- Cargando -->
          <div v-if="msgsLoading" class="flex justify-center items-center h-32">
            <span class="loading loading-dots loading-md" style="color: #128C7E"></span>
          </div>

          <!-- Sin mensajes -->
          <div v-else-if="sortedMessages.length === 0" class="flex justify-center items-center h-32">
            <div class="badge badge-ghost text-gray-400 py-3">Sin mensajes en esta conversación</div>
          </div>

          <!-- Mensajes tipo DaisyUI chat bubbles -->
          <template v-else>
            <div
              v-for="msg in sortedMessages"
              :key="msg.id"
              :class="['chat', msg.status === 'sent' ? 'chat-end' : 'chat-start']"
            >
              <div
                class="chat-bubble shadow-sm text-sm"
                style="max-width: 75%; min-width: 80px;"
                :style="msg.status === 'sent'
                  ? 'background-color:#DCF8C6; color:#111; border-radius:12px 0 12px 12px;'
                  : 'background-color:#FFFFFF; color:#111; border-radius:0 12px 12px 12px;'"
                @contextmenu.prevent="openContextMenu($event, 'message', msg)"
              >
                <!-- IMAGE -->
                <template v-if="msg.message_type === 'image' && msg.media_id">
                  <img
                    :src="wsWebhookApi.getMediaProxyUrl(msg.media_id)"
                    class="rounded-lg max-w-full cursor-pointer mb-1"
                    style="max-height: 280px; object-fit: cover;"
                    @click="openMediaFullscreen(wsWebhookApi.getMediaProxyUrl(msg.media_id), 'image')"
                    loading="lazy"
                    alt="Imagen"
                  />
                  <div v-if="msg.message_text" class="break-words leading-snug text-xs mt-1">
                    {{ msg.message_text }}
                  </div>
                </template>

                <!-- VIDEO -->
                <template v-else-if="msg.message_type === 'video' && msg.media_id">
                  <video
                    controls
                    :src="wsWebhookApi.getMediaProxyUrl(msg.media_id)"
                    class="rounded-lg max-w-full mb-1"
                    style="max-height: 280px;"
                    preload="metadata"
                  ></video>
                </template>

                <!-- AUDIO -->
                <template v-else-if="msg.message_type === 'audio' && msg.media_id">
                  <audio
                    controls
                    :src="wsWebhookApi.getMediaProxyUrl(msg.media_id)"
                    class="w-full"
                    style="min-width: 220px;"
                    preload="metadata"
                  ></audio>
                </template>

                <!-- DOCUMENT -->
                <template v-else-if="msg.message_type === 'document' && msg.media_id">
                  <a
                    :href="wsWebhookApi.getMediaProxyUrl(msg.media_id)"
                    target="_blank"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 no-underline"
                    style="background-color: #f0f0f0;"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 flex-shrink-0" style="color: #075E54" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium truncate" style="color: #111">
                        {{ msg.message_text || 'Documento' }}
                      </p>
                      <p class="text-xs" style="color: #888">{{ msg.media_mime_type || 'Archivo' }}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" style="color: #888" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                  </a>
                </template>

                <!-- LOCATION -->
                <template v-else-if="msg.message_type === 'location' && msg.message_text">
                  <a
                    :href="getLocationUrl(msg.message_text)"
                    target="_blank"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg mb-1 no-underline"
                    style="background-color: #f0f0f0;"
                  >
                    <span style="font-size: 28px">📍</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium" style="color: #111">
                        {{ getLocationLabel(msg.message_text) }}
                      </p>
                      <p class="text-xs" style="color: #075E54">Abrir en Google Maps</p>
                    </div>
                  </a>
                </template>

                <!-- CONTACTS -->
                <template v-else-if="msg.message_type === 'contacts' && msg.message_text">
                  <div class="flex items-center gap-2 px-2 py-1">
                    <span style="font-size: 24px">👤</span>
                    <div class="text-xs">
                      <p class="font-medium" style="color: #111">{{ getContactLabel(msg.message_text) }}</p>
                      <p style="color: #888">Contacto compartido</p>
                    </div>
                  </div>
                </template>

                <!-- TEXT (default) -->
                <template v-else>
                  <div v-if="msg.message_text" class="break-words leading-snug">
                    {{ msg.message_text }}
                  </div>
                  <div v-if="msg.media_id && !(['image','video','audio','document'].includes(msg.message_type))" class="flex items-center gap-1 text-gray-500 text-xs mt-1">
                    <span>📎</span>
                    <span class="capitalize">{{ msg.message_type }}</span>
                  </div>
                </template>

                <div class="flex items-center justify-end gap-1 mt-1">
                  <span class="text-xs" style="color: #999">{{ formatChatTime(msg.timestamp) }}</span>
                  <span v-if="msg.status === 'sent'" class="text-xs" style="color:#4FC3F7">✓✓</span>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Avisos de feedback — fuera del scroll, siempre visibles -->
        <div
          v-if="chatReplyError"
          class="px-4 py-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100 flex-shrink-0"
        >
          {{ chatReplyError }}
        </div>
        <div
          v-if="chatReplySuccess"
          class="px-4 py-1.5 text-xs text-green-600 bg-green-50 border-t border-green-100 flex-shrink-0"
        >
          Mensaje enviado ✓
        </div>

        <!-- Input de respuesta — anclado al fondo, NUNCA dentro del scroll -->
        <div class="flex items-end gap-2 px-3 py-3 flex-shrink-0" style="background-color: #F0F2F5">
          <textarea
            v-model="chatReplyText"
            rows="1"
            placeholder="Escribe un mensaje (Ctrl+Enter para enviar)"
            class="textarea flex-1 resize-none rounded-2xl text-sm leading-snug border-none bg-white shadow-sm"
            style="min-height: 42px; max-height: 120px; outline: none;"
            @keydown.ctrl.enter="sendChatReply"
            @input="autoResize"
            ref="chatReplyTextarea"
          ></textarea>
          <button
            @click="sendChatReply"
            :disabled="!chatReplyText.trim() || sendingChatReply"
            class="btn btn-circle border-none text-white flex-shrink-0"
            :style="{
              backgroundColor: (!chatReplyText.trim() || sendingChatReply) ? '#a0aec0' : '#075E54',
              width: '44px', height: '44px', minHeight: '44px',
              cursor: (!chatReplyText.trim() || sendingChatReply) ? 'not-allowed' : 'pointer',
            }"
          >
            <span v-if="sendingChatReply" class="loading loading-spinner loading-xs"></span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </template>
    </div>

    <!-- ═══════════════════════════════════════════
         Context Menu flotante (click derecho)
    ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="fixed inset-0 z-40"
        @click="closeContextMenu"
        @contextmenu.prevent="closeContextMenu"
      ></div>
      <div
        v-if="contextMenu.visible"
        class="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <!-- Opción de eliminar -->
        <button
          @click="confirmDelete"
          class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
          {{ contextMenu.type === 'conversation' ? 'Eliminar chat' : 'Eliminar mensaje' }}
        </button>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════
         Modal de confirmación de eliminación
    ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="deleteConfirm.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ deleteConfirm.type === 'conversation' ? '¿Eliminar este chat?' : '¿Eliminar este mensaje?' }}
          </h3>
          <p class="text-sm text-gray-500 mb-5">
            <template v-if="deleteConfirm.type === 'conversation'">
              Se eliminarán todos los mensajes de <strong>{{ deleteConfirm.label }}</strong>. Esta acción no se puede deshacer.
            </template>
            <template v-else>
              Este mensaje se eliminará permanentemente.
            </template>
          </p>
          <div class="flex justify-end gap-2">
            <button
              @click="cancelDelete"
              class="btn btn-sm btn-ghost"
            >
              Cancelar
            </button>
            <button
              @click="executeDelete"
              :disabled="deleteConfirm.loading"
              class="btn btn-sm btn-error text-white"
            >
              <span v-if="deleteConfirm.loading" class="loading loading-spinner loading-xs"></span>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ═══════════════════════════════════════════
         Fullscreen media viewer (imágenes)
    ═══════════════════════════════════════════ -->
    <Teleport to="body">
      <div
        v-if="mediaViewer.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="mediaViewer.visible = false"
      >
        <button
          @click="mediaViewer.visible = false"
          class="absolute top-4 right-4 btn btn-circle btn-sm bg-white/20 border-none text-white hover:bg-white/40"
        >
          ✕
        </button>
        <img
          v-if="mediaViewer.type === 'image'"
          :src="mediaViewer.url"
          class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue';
import { useQuery, useQueryClient } from '@tanstack/vue-query';
import { wsWebhookApi, type IncomingMessage, type Conversation } from '@/api/wsWebhookApi';
import {
  seenConversations,
  markConversationSeen,
  loadSeenConversationsFromServer,
} from '@/composables/useSeenConversations';

// ── Query client para invalidar caché manualmente ─────────────────────────────
const queryClient = useQueryClient();

// ── State local ───────────────────────────────────────────────────────────────
const selectedPhone    = ref<string | null>(null);
const chatSearchQuery  = ref('');
const chatReplyText    = ref('');
const sendingChatReply = ref(false);
const chatReplySuccess = ref(false);
const chatReplyError   = ref('');
const chatReplyTextarea = ref<HTMLTextAreaElement | null>(null);
const messagesContainer = ref<HTMLDivElement | null>(null);

// ── Context menu state ────────────────────────────────────────────────────────
const contextMenu = ref<{
  visible: boolean;
  x: number;
  y: number;
  type: 'message' | 'conversation';
  targetId: string;
  targetPhone: string;
  targetLabel: string;
}>({ visible: false, x: 0, y: 0, type: 'message', targetId: '', targetPhone: '', targetLabel: '' });

// ── Delete confirmation state ─────────────────────────────────────────────────
const deleteConfirm = ref<{
  visible: boolean;
  type: 'message' | 'conversation';
  id: string;
  phone: string;
  label: string;
  loading: boolean;
}>({ visible: false, type: 'message', id: '', phone: '', label: '', loading: false });

// ── Media fullscreen viewer ───────────────────────────────────────────────────
const mediaViewer = ref<{ visible: boolean; url: string; type: string }>({
  visible: false, url: '', type: 'image',
});

// ── TanStack Query: conversaciones (auto-refresh cada 60s) ────────────────────
const {
  data: conversationsData,
  isLoading: convosLoading,
  isRefetching: convosRefetching,
} = useQuery({
  queryKey: ['ws-conversations'],
  queryFn: () => wsWebhookApi.getConversations(),
  refetchInterval: 60_000,
  staleTime: 50_000,
  gcTime: 5 * 60_000,
});

const conversations = computed(() => conversationsData.value ?? []);

// ── TanStack Query: mensajes de la conversación activa (auto-refresh cada 60s) ─
const {
  data: messagesData,
  isLoading: msgsLoading,
  isRefetching: msgsRefetching,
} = useQuery({
  queryKey: computed(() => ['ws-messages', selectedPhone.value]),
  queryFn: () => wsWebhookApi.getMessagesByPhone(selectedPhone.value!),
  enabled: computed(() => !!selectedPhone.value),
  refetchInterval: 60_000,
  staleTime: 50_000,
  gcTime: 5 * 60_000,
});

// Mensajes ordenados por timestamp asc
const sortedMessages = computed<IncomingMessage[]>(() =>
  (messagesData.value ?? []).slice().sort((a, b) => a.timestamp - b.timestamp),
);

// Datos de la conversación seleccionada (para mostrar nombre/avatar en el header)
const selectedConvData = computed<Conversation | undefined>(() =>
  conversations.value.find(c => c.phone === selectedPhone.value),
);

// Scroll al fondo cuando llegan nuevos mensajes
watch(sortedMessages, async () => {
  await nextTick();
  scrollToBottom();
});

// ── Computed: búsqueda ────────────────────────────────────────────────────────
const filteredConversations = computed(() => {
  const q = chatSearchQuery.value.trim().toLowerCase();
  if (!q) return conversations.value;
  return conversations.value.filter(c =>
    c.contact_name?.toLowerCase().includes(q) ||
    c.phone.includes(q) ||
    c.last_message_text?.toLowerCase().includes(q),
  );
});

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Cargar estado de leídos desde el servidor para sincronizar entre dispositivos
  await loadSeenConversationsFromServer();
});

// ── Seleccionar conversación ──────────────────────────────────────────────────
async function selectConversation(conv: Conversation) {
  selectedPhone.value = conv.phone;
  // Marcar como leída: actualiza ref reactivo + persiste en servidor
  await markConversationSeen(conv.phone, conv.last_message_timestamp);
  // Invalidar la query de mensajes para que cargue inmediatamente
  await queryClient.invalidateQueries({ queryKey: ['ws-messages', conv.phone] });
}

// ── Refresh manual ────────────────────────────────────────────────────────────
function refreshConversations() {
  queryClient.invalidateQueries({ queryKey: ['ws-conversations'] });
}
function refreshMessages() {
  if (selectedPhone.value) {
    queryClient.invalidateQueries({ queryKey: ['ws-messages', selectedPhone.value] });
  }
}

// ── Enviar respuesta ──────────────────────────────────────────────────────────
async function sendChatReply() {
  if (!selectedPhone.value || !chatReplyText.value.trim()) return;
  sendingChatReply.value = true;
  chatReplyError.value = '';
  chatReplySuccess.value = false;
  try {
    await wsWebhookApi.replyMessage(selectedPhone.value, chatReplyText.value.trim());
    chatReplySuccess.value = true;
    chatReplyText.value = '';
    if (chatReplyTextarea.value) {
      chatReplyTextarea.value.style.height = 'auto';
    }
    // Refrescar mensajes tras breve demora para que el servidor procese el envío
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['ws-messages', selectedPhone.value] });
      queryClient.invalidateQueries({ queryKey: ['ws-conversations'] });
      setTimeout(() => { chatReplySuccess.value = false; }, 2000);
    }, 800);
  } catch (err: any) {
    chatReplyError.value = err?.response?.data?.message || err.message || 'Error al enviar';
  } finally {
    sendingChatReply.value = false;
  }
}

// ── Indicador de no leído ─────────────────────────────────────────────────────
function isConversationUnread(conv: Conversation): boolean {
  return conv.last_message_timestamp > (seenConversations.value[conv.phone] ?? 0);
}

// ── Context menu ──────────────────────────────────────────────────────────────
function openContextMenu(event: MouseEvent, type: 'message' | 'conversation', target: any) {
  const x = Math.min(event.clientX, window.innerWidth - 200);
  const y = Math.min(event.clientY, window.innerHeight - 60);
  contextMenu.value = {
    visible: true,
    x, y,
    type,
    targetId: type === 'message' ? target.id : '',
    targetPhone: type === 'conversation' ? target.phone : '',
    targetLabel: type === 'conversation'
      ? (target.contact_name || target.phone)
      : (target.message_text?.substring(0, 40) || 'mensaje'),
  };
}

function closeContextMenu() {
  contextMenu.value.visible = false;
}

function confirmDelete() {
  deleteConfirm.value = {
    visible: true,
    type: contextMenu.value.type,
    id: contextMenu.value.targetId,
    phone: contextMenu.value.targetPhone,
    label: contextMenu.value.targetLabel,
    loading: false,
  };
  closeContextMenu();
}

function cancelDelete() {
  deleteConfirm.value.visible = false;
}

async function executeDelete() {
  deleteConfirm.value.loading = true;
  try {
    if (deleteConfirm.value.type === 'message') {
      await wsWebhookApi.deleteMessage(deleteConfirm.value.id);
      // Refrescar mensajes de la conversación activa
      if (selectedPhone.value) {
        await queryClient.invalidateQueries({ queryKey: ['ws-messages', selectedPhone.value] });
      }
      await queryClient.invalidateQueries({ queryKey: ['ws-conversations'] });
    } else {
      await wsWebhookApi.deleteConversation(deleteConfirm.value.phone);
      // Si borramos la conversación activa, deseleccionar
      if (selectedPhone.value === deleteConfirm.value.phone) {
        selectedPhone.value = null;
      }
      await queryClient.invalidateQueries({ queryKey: ['ws-conversations'] });
    }
  } catch (err: any) {
    console.error('Error al eliminar:', err);
  } finally {
    deleteConfirm.value.visible = false;
    deleteConfirm.value.loading = false;
  }
}

// Cerrar context menu con Escape
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeContextMenu();
    if (mediaViewer.value.visible) mediaViewer.value.visible = false;
    if (deleteConfirm.value.visible) cancelDelete();
  }
}
onMounted(() => document.addEventListener('keydown', handleKeydown));
onBeforeUnmount(() => document.removeEventListener('keydown', handleKeydown));

// ── Media fullscreen ──────────────────────────────────────────────────────────
function openMediaFullscreen(url: string, type: string) {
  mediaViewer.value = { visible: true, url, type };
}

// ── Location helpers ──────────────────────────────────────────────────────────
function getLocationUrl(jsonStr: string): string {
  try {
    const loc = JSON.parse(jsonStr);
    return `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
  } catch {
    return '#';
  }
}

function getLocationLabel(jsonStr: string): string {
  try {
    const loc = JSON.parse(jsonStr);
    return loc.name || loc.address || `${loc.latitude}, ${loc.longitude}`;
  } catch {
    return 'Ubicación';
  }
}

// ── Contact helpers ───────────────────────────────────────────────────────────
function getContactLabel(jsonStr: string): string {
  try {
    const contacts = JSON.parse(jsonStr);
    if (Array.isArray(contacts) && contacts.length > 0) {
      const c = contacts[0];
      const name = c.name?.formatted_name || c.name?.first_name || 'Contacto';
      const phone = c.phones?.[0]?.phone || '';
      return phone ? `${name} (${phone})` : name;
    }
    return 'Contacto';
  } catch {
    return 'Contacto';
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
  if (diffDays === 0) return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
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
