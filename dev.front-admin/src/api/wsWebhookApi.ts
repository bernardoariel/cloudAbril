// Servicio API para consultar mensajes del webhook de WhatsApp
import axios from 'axios';

// Usa VITE_WHATSAPP_BASE_URL que apunta al servicio ws (ws.abrilviveenvos.com en prod)
const WS_API_URL = import.meta.env.VITE_WHATSAPP_BASE_URL || 'http://localhost:3001';

export interface IncomingMessage {
  id: string;
  whatsapp_message_id: string;
  phone_from: string;
  contact_name?: string;
  message_type: string;
  message_text?: string;
  media_url?: string;
  media_id?: string;
  media_mime_type?: string;
  timestamp: number;
  status: string;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  whatsapp_message_id?: string;
  phone_number?: string;
  message_status?: string;
  timestamp?: number;
  raw_payload: string;
  created_at: string;
  message_text?: string;
  message_contact_name?: string;
  template_tipo?: string;
  template_source_id?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface WebhookStats {
  totalMessages: number;
  totalEvents: number;
  uniquePhones: number;
  messageTypes: Record<string, number>;
  lastUpdate: string;
}

export interface Conversation {
  phone: string;
  contact_name?: string;
  last_message_text?: string;
  last_message_timestamp: number;
  unread_count?: number;
  message_count: number;
}

class WsWebhookApi {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  /**
   * Obtener mensajes entrantes con paginación y filtro de fecha
   */
  async getIncomingMessages(
    page = 1,
    limit = 50,
    from?: string,
    to?: string,
  ): Promise<PaginatedResponse<IncomingMessage>> {
    const params: Record<string, any> = { page, limit };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(
      `${WS_API_URL}/whatsapp/incoming-messages`,
      {
        params,
        ...this.getAuthHeader(),
      }
    );
    return response.data;
  }

  /**
   * Obtener mensajes por teléfono
   */
  async getMessagesByPhone(phone: string): Promise<IncomingMessage[]> {
    const response = await axios.get(
      `${WS_API_URL}/whatsapp/incoming-messages/by-phone`,
      {
        params: { phone },
        ...this.getAuthHeader(),
      }
    );
    return response.data;
  }

  /**
   * Obtener eventos del webhook con paginación y filtro de fecha
   */
  async getWebhookEvents(
    page = 1,
    limit = 50,
    from?: string,
    to?: string,
  ): Promise<PaginatedResponse<WebhookEvent>> {
    const params: Record<string, any> = { page, limit };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(
      `${WS_API_URL}/whatsapp/webhook-events`,
      {
        params,
        ...this.getAuthHeader(),
      }
    );
    return response.data;
  }

  /**
   * Obtener estadísticas
   */
  async getStats(): Promise<WebhookStats> {
    const response = await axios.get(
      `${WS_API_URL}/whatsapp/stats`,
      this.getAuthHeader()
    );
    return response.data;
  }

  /**
   * Responder un mensaje de texto libre
   * Solo funciona dentro de la ventana de 24hs del último mensaje del usuario
   */
  async replyMessage(to: string, text: string): Promise<any> {
    const response = await axios.post(
      `${WS_API_URL}/whatsapp/reply`,
      { to, text },
      this.getAuthHeader()
    );
    return response.data;
  }

  /**
   * Obtener lista de conversaciones únicas (agrupadas por teléfono)
   * Esta es una implementación temporal que agrupa los mensajes en el frontend
   */
  async getConversations(): Promise<Conversation[]> {
    // Obtener todos los mensajes recientes (últimos 1000)
    const response = await this.getIncomingMessages(1, 1000);
    const messages = response.data;

    // Agrupar por teléfono
    const conversationsMap = new Map<string, Conversation>();
    
    messages.forEach((msg) => {
      const existing = conversationsMap.get(msg.phone_from);
      
      if (!existing) {
        conversationsMap.set(msg.phone_from, {
          phone: msg.phone_from,
          contact_name: msg.contact_name,
          last_message_text: msg.message_text,
          last_message_timestamp: msg.timestamp,
          message_count: 1,
        });
      } else {
        existing.message_count++;
        // Actualizar si este mensaje es más reciente
        if (msg.timestamp > existing.last_message_timestamp) {
          existing.last_message_text = msg.message_text;
          existing.last_message_timestamp = msg.timestamp;
          existing.contact_name = msg.contact_name || existing.contact_name;
        }
      }
    });

    // Convertir a array y ordenar por timestamp descendente
    return Array.from(conversationsMap.values())
      .sort((a, b) => b.last_message_timestamp - a.last_message_timestamp);
  }
}

export const wsWebhookApi = new WsWebhookApi();
