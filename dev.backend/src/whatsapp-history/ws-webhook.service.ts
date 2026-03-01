import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Injectable()
export class WsWebhookService {
  private readonly logger = new Logger(WsWebhookService.name);
  private readonly wsServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // URL del servicio ws (ajusta según tu configuración)
    this.wsServiceUrl = this.configService.get<string>(
      'WS_SERVICE_URL',
      'http://localhost:3002',
    );
  }

  /**
   * Obtiene mensajes entrantes del servicio ws
   */
  async getIncomingMessages(page: number, limit: number) {
    try {
      const url = `${this.wsServiceUrl}/whatsapp/incoming-messages?page=${page}&limit=${limit}`;
      const response: AxiosResponse = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching incoming messages: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene mensajes por teléfono del servicio ws
   */
  async getMessagesByPhone(phone: string) {
    try {
      const url = `${this.wsServiceUrl}/whatsapp/incoming-messages/by-phone?phone=${phone}`;
      const response: AxiosResponse = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching messages by phone: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene eventos del webhook del servicio ws
   */
  async getWebhookEvents(page: number, limit: number) {
    try {
      const url = `${this.wsServiceUrl}/whatsapp/webhook-events?page=${page}&limit=${limit}`;
      const response: AxiosResponse = await firstValueFrom(this.httpService.get(url));
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error fetching webhook events: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de mensajes
   */
  async getStats() {
    try {
      // Obtener los últimos mensajes para calcular estadísticas
      const messages = await this.getIncomingMessages(1, 1000);
      const events = await this.getWebhookEvents(1, 1000);

      const messageTypes = {};
      const phoneNumbers = new Set();

      if (messages.data) {
        messages.data.forEach((msg: any) => {
          messageTypes[msg.message_type] = (messageTypes[msg.message_type] || 0) + 1;
          phoneNumbers.add(msg.phone_from);
        });
      }

      return {
        totalMessages: messages.total || 0,
        totalEvents: events.total || 0,
        uniquePhones: phoneNumbers.size,
        messageTypes,
        lastUpdate: new Date(),
      };
    } catch (error) {
      this.logger.error(`Error calculating stats: ${error.message}`);
      return {
        totalMessages: 0,
        totalEvents: 0,
        uniquePhones: 0,
        messageTypes: {},
        error: (error as any).message,
      };
    }
  }
}
