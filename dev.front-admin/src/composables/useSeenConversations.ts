/**
 * Composable compartido que gestiona el estado reactivo de "leídos" por conversación.
 *
 * - Mantiene un `ref` reactivo (singleton de módulo) para que tanto la vista del chat
 *   como el NavHeader/useWhatsappNotifications recalculen automáticamente al marcar leído.
 * - Persiste en localStorage como fallback inmediato.
 * - Sincroniza con el servidor (tabla ws_read_status) para compartir el estado entre
 *   múltiples dispositivos/oficinas del mismo usuario.
 */
import { ref, watch } from 'vue';
import { wsWebhookApi } from '@/api/wsWebhookApi';
import { useAuthStore } from '@/store/useAuth';

const SEEN_CONVOS_KEY = 'whatsapp_seen_conversations';

// ── Estado reactivo singleton (nivel módulo) ──────────────────────────────────
// Al iniciar, carga localStorage para tener algo inmediato antes del fetch del servidor.
export const seenConversations = ref<Record<string, number>>(
  (() => {
    try {
      return JSON.parse(localStorage.getItem(SEEN_CONVOS_KEY) || '{}');
    } catch {
      return {};
    }
  })(),
);

// Cada vez que cambia el ref, persiste en localStorage.
watch(
  seenConversations,
  (val) => {
    localStorage.setItem(SEEN_CONVOS_KEY, JSON.stringify(val));
  },
  { deep: true },
);

// ── API pública ───────────────────────────────────────────────────────────────

/**
 * Marca una conversación como leída localmente Y en el servidor.
 * La reactividad del ref hace que la campanita y los indicadores se actualicen al instante.
 */
export async function markConversationSeen(phone: string, timestamp: number): Promise<void> {
  // Actualizar ref reactivo de forma inmutable para que Vue detecte el cambio
  seenConversations.value = { ...seenConversations.value, [phone]: timestamp };

  // Sincronizar con el servidor (best-effort: nunca bloquear la UI por esto)
  try {
    const authStore = useAuthStore();
    const email = authStore.user;
    if (email) {
      await wsWebhookApi.markRead(phone, email, timestamp);
    }
  } catch (err) {
    // Silencioso: ya está guardado en localStorage
    console.warn('[useSeenConversations] Error al sincronizar con server:', err);
  }
}

/**
 * Carga el estado de leídos desde el servidor y actualiza el ref reactivo.
 * Llamar al montar la vista de chat para sincronizar el estado entre oficinas.
 */
export async function loadSeenConversationsFromServer(): Promise<void> {
  try {
    const authStore = useAuthStore();
    const email = authStore.user;
    if (!email) return;

    const serverStatus = await wsWebhookApi.getReadStatus(email);
    // Merge: para cada teléfono, usar el mayor timestamp (servidor vs localStorage)
    const merged: Record<string, number> = { ...seenConversations.value };
    for (const [phone, ts] of Object.entries(serverStatus)) {
      merged[phone] = Math.max(merged[phone] ?? 0, ts);
    }
    seenConversations.value = merged;
  } catch (err) {
    console.warn('[useSeenConversations] Error al cargar desde server:', err);
  }
}
