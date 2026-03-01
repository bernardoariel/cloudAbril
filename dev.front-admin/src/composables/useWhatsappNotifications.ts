import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { wsWebhookApi } from '@/api/wsWebhookApi';
import { useAuthStore } from '@/store/useAuth';

// Misma clave que usa WsWebhookMessages.vue para rastrear leídos por conversación
const SEEN_CONVOS_KEY = 'whatsapp_seen_conversations';

function getSeenConversations(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(SEEN_CONVOS_KEY) || '{}');
  } catch {
    return {};
  }
}

// Lista de emails de administradores
const administradoresEmails = ['mario@abrilamoblamientos.com.ar'];

export const useWhatsappNotifications = () => {
  const authStore = useAuthStore();

  const isAdmin = computed(() => administradoresEmails.includes(authStore.user ?? ''));

  // Obtiene conversaciones — se refresca cada 60s
  const { data, isLoading, error } = useQuery({
    queryKey: ['whatsapp-notifications-convos'],
    queryFn: () => wsWebhookApi.getConversations(),
    refetchInterval: 60000,
    staleTime: 50000,
    gcTime: 5 * 60 * 1000,
    enabled: isAdmin,
  });

  // Conversaciones no leídas: aquellas donde el último mensaje es más nuevo que lo visto
  const unreadCount = computed(() => {
    if (!data.value) return 0;
    const seen = getSeenConversations();
    return data.value.filter(
      c => c.last_message_timestamp > (seen[c.phone] ?? 0)
    ).length;
  });

  const hasNewMessages = computed(() => unreadCount.value > 0);

  /**
   * Se llama al entrar a la vista de chat.
   * No hace nada aquí porque cada conversación se marca al abrirla.
   * Existe por compatibilidad con el NavHeader.
   */
  const markAsRead = () => {};

  return {
    unreadCount,
    hasNewMessages,
    isLoading,
    error,
    isAdmin,
    markAsRead,
  };
};
