import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { WsWebhookService } from './ws-webhook.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ws-webhook')
export class WsWebhookController {
  constructor(private readonly wsWebhookService: WsWebhookService) {}

  /**
   * Obtener mensajes entrantes con paginación
   */
  @Get('incoming-messages')
  @UseGuards(JwtAuthGuard)
  async getIncomingMessages(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.wsWebhookService.getIncomingMessages(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * Obtener mensajes por teléfono
   */
  @Get('incoming-messages/by-phone')
  @UseGuards(JwtAuthGuard)
  async getMessagesByPhone(@Query('phone') phone: string) {
    if (!phone) {
      return { error: 'Phone parameter is required' };
    }
    return this.wsWebhookService.getMessagesByPhone(phone);
  }

  /**
   * Obtener eventos del webhook con paginación
   */
  @Get('webhook-events')
  @UseGuards(JwtAuthGuard)
  async getWebhookEvents(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.wsWebhookService.getWebhookEvents(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * Obtener estadísticas de mensajes (público - solo contadores)
   */
  @Get('stats')
  async getStats() {
    return this.wsWebhookService.getStats();
  }
}
