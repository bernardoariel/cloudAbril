import { Controller, Post, Body, UsePipes, ValidationPipe, Get, Delete, Param, Query, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

import { AvisoCompraDto } from './dto/aviso-compra.dto';
import { AvisoPagoDto } from './dto/aviso-pago.dto';
import { Moroso1Dto } from './dto/moroso-1.dto';
import { Moroso2Dto } from './dto/moroso-2.dto';
import { Moroso3Dto } from './dto/moroso-3.dto';
import { WhatsAppService } from './whatsapp.service';
import { WebhookService } from './webhook.service';
import { WhatsAppWebhookDto } from './dto/webhook.dto';

@Controller('whatsapp')
export class WhatsAppController {
  private readonly logger = new Logger(WhatsAppController.name);

  constructor(
    private readonly wsService: WhatsAppService,
    private readonly webhookService: WebhookService,
  ) { }

  @Post('aviso_compra_abril')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendAvisoCompra(@Body() b: AvisoCompraDto) {
    const result = await this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'aviso_compra_abril',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'cod_venta', text: b.cod_venta },
              { type: 'text', parameter_name: 'fecha_compra', text: b.fecha_compra },
              { type: 'text', parameter_name: 'documento', text: b.documento },
              { type: 'text', parameter_name: 'product_list', text: b.product_list },
              { type: 'text', parameter_name: 'pago_list', text: b.pago_list },
            ],
          },
        ],
      },
    });

    // Guardar mensaje saliente para que aparezca en eventos
    const messageId = result?.messages?.[0]?.id;
    const textoResumen = `[Template: aviso_compra_abril] Nombre: ${b.nombre}, Venta: ${b.cod_venta}, Productos: ${b.product_list}`;
    await this.webhookService.saveOutgoingMessage(b.to, textoResumen, messageId, b.nombre);

    return result;
  }

  @Post('aviso_pago_abril')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendAvisoPago(@Body() b: AvisoPagoDto) {
    const result = await this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'aviso_pago_abril',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'nro_operacion', text: b.nro_operacion },
              { type: 'text', parameter_name: 'nro_recibo', text: b.nro_recibo },
              { type: 'text', parameter_name: 'fecha', text: b.fecha },
              { type: 'text', parameter_name: 'documento', text: b.documento },
              { type: 'text', parameter_name: 'nombre_sucursal', text: b.nombre_sucursal },
              { type: 'text', parameter_name: 'importe', text: b.importe },
            ],
          },
        ],
      },
    });

    // Guardar mensaje saliente para que aparezca en eventos
    const messageId = result?.messages?.[0]?.id;
    const textoResumen = `[Template: aviso_pago_abril] Nombre: ${b.nombre}, Recibo: ${b.nro_recibo}, Importe: ${b.importe}`;
    await this.webhookService.saveOutgoingMessage(b.to, textoResumen, messageId, b.nombre);

    return result;
  }

  @Post('moroso_1')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendMoroso1(@Body() b: Moroso1Dto) {
    const result = await this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'moroso_1',
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'cliente', text: b.cliente },
              { type: 'text', parameter_name: 'nro_cuenta', text: b.nro_cuenta },
              { type: 'text', parameter_name: 'importe', text: b.importe },
              { type: 'text', parameter_name: 'fecha_max_pago', text: b.fecha_max_pago },
            ],
          },
        ],
      },
    });

    const messageId = result?.messages?.[0]?.id;
    const resumen = `[Template: moroso_1] Cliente: ${b.cliente}, Cuenta: ${b.nro_cuenta}, Importe: ${b.importe}`;
    await this.webhookService.saveOutgoingMessage(b.to, resumen, messageId, b.cliente);

    return result;
  }

  @Post('moroso_2')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendMoroso2(@Body() b: Moroso2Dto) {
    const result = await this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'moroso_2',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'nro_cuenta', text: b.nro_cuenta },
              { type: 'text', parameter_name: 'importe', text: b.importe },
            ],
          },
        ],
      },
    });

    const messageId = result?.messages?.[0]?.id;
    const resumen = `[Template: moroso_2] Nombre: ${b.nombre}, Cuenta: ${b.nro_cuenta}, Importe: ${b.importe}`;
    await this.webhookService.saveOutgoingMessage(b.to, resumen, messageId, b.nombre);

    return result;
  }

  @Post('moroso_3')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendMoroso3(@Body() b: Moroso3Dto) {
    const result = await this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'moroso_3',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'fecha', text: b.fecha },
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'nro_cuenta', text: b.nro_cuenta },
              { type: 'text', parameter_name: 'importe', text: b.importe },
            ],
          },
        ],
      },
    });

    const messageId = result?.messages?.[0]?.id;
    const resumen = `[Template: moroso_3] Nombre: ${b.nombre}, Cuenta: ${b.nro_cuenta}, Importe: ${b.importe}`;
    await this.webhookService.saveOutgoingMessage(b.to, resumen, messageId, b.nombre);

    return result;
  }

  @Post('hola_abril')
  async sendHelloWorld(@Body('to') to: string) {
    const result = await this.wsService.sendHelloWorld(to);

    // Guardar mensaje saliente
    const messageId = result?.messages?.[0]?.id;
    await this.webhookService.saveOutgoingMessage(to, '[Template: hola_abril] Mensaje de bienvenida', messageId);

    return result;
  }

  /**
   * Endpoint para responder un mensaje de texto libre
   * Solo funciona dentro de la ventana de 24hs del último mensaje del usuario
   */
  @Post('reply')
  async replyMessage(@Body() body: { to: string; text: string }) {
    if (!body.to || !body.text) {
      return { error: 'Se requiere "to" (teléfono) y "text" (mensaje)' };
    }
    this.logger.log(`Replying to ${body.to}: "${body.text.substring(0, 50)}"`);
    
    // Enviar el mensaje
    const result = await this.wsService.sendTextMessage(body.to, body.text);
    
    // Guardar en el historial
    const messageId = result?.messages?.[0]?.id;
    await this.webhookService.saveOutgoingMessage(body.to, body.text, messageId);
    
    return result;
  }

  @Get('hello_world')
  async getHelloWorld(@Query('to') to: string) {
    return this.wsService.sendHelloWorld(to);
  }

  /**
   * Webhook verification endpoint (GET)
   * WhatsApp enviará una solicitud GET para verificar el webhook
   */
  @Get('webhook')
  async verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    this.logger.log(`Webhook verification request: mode=${mode}, token=${token}`);

    const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      this.logger.log('Webhook verified successfully');
      return res.status(HttpStatus.OK).send(challenge);
    } else {
      this.logger.warn('Webhook verification failed');
      return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
    }
  }

  /**
   * Webhook endpoint para recibir eventos de WhatsApp (POST)
   */
  @Post('webhook')
  async receiveWebhook(@Body() body: WhatsAppWebhookDto, @Res() res: Response) {
    this.logger.log('Received webhook event');
    this.logger.debug(JSON.stringify(body, null, 2));

    try {
      // Procesar el webhook de forma asíncrona
      this.webhookService.processWebhook(body).catch((error) => {
        this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
      });

      // Responder inmediatamente a WhatsApp
      return res.status(HttpStatus.OK).json({ status: 'received' });
    } catch (error) {
      this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
    }
  }

  /**
   * Endpoint para consultar mensajes entrantes
   */
  @Get('incoming-messages')
  async getIncomingMessages(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.webhookService.getIncomingMessages(
      parseInt(page, 10),
      parseInt(limit, 10),
      from,
      to,
    );
  }

  /**
   * Endpoint para consultar mensajes por teléfono
   */
  @Get('incoming-messages/by-phone')
  async getMessagesByPhone(@Query('phone') phone: string) {
    return this.webhookService.getMessagesByPhone(phone);
  }

  /**
   * Endpoint para consultar eventos del webhook
   */
  @Get('webhook-events')
  async getWebhookEvents(
    @Query('page') page = '1',
    @Query('limit') limit = '50',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.webhookService.getWebhookEvents(
      parseInt(page, 10),
      parseInt(limit, 10),
      from,
      to,
    );
  }

  /**
   * Endpoint para obtener estadísticas
   */
  @Get('stats')
  async getStats() {
    return this.webhookService.getStats();
  }

  /**
   * Marca una conversación como leída por un admin
   */
  @Post('mark-read')
  async markRead(@Body() body: { phone: string; reader_email: string; last_seen_at: number }) {
    await this.webhookService.markRead(body.phone, body.reader_email, body.last_seen_at);
    return { success: true };
  }

  /**
   * Obtiene el estado de lectura de todas las conversaciones para un admin
   */
  @Get('read-status')
  async getReadStatus(@Query('email') email: string) {
    return this.webhookService.getReadStatus(email);
  }

  /**
   * Proxy de media: descarga un archivo multimedia de WhatsApp y lo sirve al frontend
   */
  @Get('media/:mediaId')
  async getMedia(@Param('mediaId') mediaId: string, @Res() res: Response) {
    try {
      const { buffer, mimeType } = await this.wsService.downloadMedia(mediaId);
      res.set({
        'Content-Type': mimeType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      });
      return res.send(buffer);
    } catch (error: any) {
      this.logger.error(`Error proxying media ${mediaId}: ${error.message}`);
      return res.status(error.status ?? 500).json({ error: 'Failed to fetch media' });
    }
  }

  /**
   * Elimina un mensaje individual por UUID
   */
  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string) {
    return this.webhookService.deleteMessage(id);
  }

  /**
   * Elimina toda una conversación (todos los mensajes de un teléfono)
   */
  @Delete('conversations/:phone')
  async deleteConversation(@Param('phone') phone: string) {
    return this.webhookService.deleteConversation(phone);
  }
}
