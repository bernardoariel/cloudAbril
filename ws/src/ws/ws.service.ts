import { HttpException, Injectable } from '@nestjs/common';

import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class WsService {
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
    this.apiVersion = this.config.get<string>('WHATSAPP_API_VERSION', 'v22.0');
    this.baseUrl = `https://graph.facebook.com/v22.0/${this.phoneNumberId}/messages`;
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
    console.log('token', this.phoneNumberId)
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
}
