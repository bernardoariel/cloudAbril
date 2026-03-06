import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { wsWebhookApi } from '@/api/wsWebhookApi';
import { useAuthStore } from '@/store/useAuth';
import { seenConversations } from '@/composables/useSeenConversations';

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

  // Conversaciones no leídas: usa el ref reactivo compartido (se recomputa al marcar leída)
  const unreadCount = computed(() => {
    if (!data.value) return 0;
    return data.value.filter(
      c => c.last_message_timestamp > (seenConversations.value[c.phone] ?? 0),
    ).length;
  });

  const hasNewMessages = computed(() => unreadCount.value > 0);

  /**
   * Compatibilidad con NavHeader — la lógica real está en markConversationSeen().
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
