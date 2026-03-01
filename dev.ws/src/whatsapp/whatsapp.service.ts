import { HttpException, Injectable, Logger } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly token: string;
  private readonly phoneNumberId: string;
  private readonly apiVersion: string;
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.token = this.config.get<string>('WHATSAPP_TOKEN')!;
    this.phoneNumberId = this.config.get<string>('WHATSAPP_PHONE_ID')!;
    this.apiVersion = this.config.get<string>('WHATSAPP_API_VERSION', 'v24.0');
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;
  }

  /**
   * Enviar mensaje de texto libre a un número
   * NOTA: Solo funciona dentro de la ventana de 24 horas (el usuario debe haber enviado un mensaje primero)
   */
  async sendTextMessage(to: string, text: string): Promise<any> {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: {
        preview_url: false,
        body: text,
      },
    };

    this.logger.log(`Sending text message to ${to}: "${text.substring(0, 50)}..."`);

    try {
      const { data } = await firstValueFrom(
        this.http.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`Message sent successfully to ${to}, message_id: ${data?.messages?.[0]?.id}`);
      return data;
    } catch (err: any) {
      const res = err?.response?.data ?? err?.message ?? 'Unknown error';
      const status = err?.response?.status ?? 500;
      this.logger.error(`Failed to send text message to ${to}: ${JSON.stringify(res)}`);
      throw new HttpException(res, status);
    }
  }

  async sendTemplate(dto: {
    to: string;
    template: { name: string; language: { code: string }; components?: any[] };
  }) {
    const payload = {
      messaging_product: 'whatsapp',
      to: dto.to,
      type: 'template',
      template: dto.template, // acepta NAMED parameters
    };
    console.log('Sending WhatsApp Template:', JSON.stringify(payload, null, 2));
    console.log('Target URL:', this.baseUrl);
    console.log('ENV Config:', {
      WHATSAPP_PHONE_ID: this.phoneNumberId,
      WHATSAPP_TOKEN_PREFIX: this.token ? this.token.substring(0, 15) + '...' : 'MISSING',
      WHATSAPP_API_VERSION: this.apiVersion,
    });
    try {
      const { data } = await firstValueFrom(
        this.http.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data; // serializable para Nest
    } catch (err: any) {
      const res = err?.response?.data ?? err?.message ?? 'Unknown error';
      const status = err?.response?.status ?? 500;
      throw new HttpException(res, status);
    }
  }

  async sendHelloWorld(to: string) {
    const payload = {
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: 'hola_abril',
        language: { code: 'es_AR' },
      },
    };

    console.log('Sending WhatsApp Hola Abril:', JSON.stringify(payload, null, 2));
    console.log('Target URL:', this.baseUrl);
    console.log('ENV Config:', {
      WHATSAPP_PHONE_ID: this.phoneNumberId,
      WHATSAPP_TOKEN_PREFIX: this.token ? this.token.substring(0, 15) + '...' : 'MISSING',
      WHATSAPP_API_VERSION: this.apiVersion,
    });

    try {
      const { data } = await firstValueFrom(
        this.http.post(this.baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      return data;
    } catch (err: any) {
      const res = err?.response?.data ?? err?.message ?? 'Unknown error';
      const status = err?.response?.status ?? 500;
      throw new HttpException(res, status);
    }
  }

}
