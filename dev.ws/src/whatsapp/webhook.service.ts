import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WsIncomingMessage, MessageType, MessageStatus } from './entities/ws-incoming-message.entity';
import { WsWebhookEvent, WebhookEventType, MessageStatusValue } from './entities/ws-webhook-event.entity';
import { WsReadStatus } from './entities/ws-read-status.entity';
import { WhatsAppWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WsIncomingMessage)
    private readonly incomingMessageRepo: Repository<WsIncomingMessage>,
    @InjectRepository(WsWebhookEvent)
    private readonly webhookEventRepo: Repository<WsWebhookEvent>,
    @InjectRepository(WsReadStatus)
    private readonly readStatusRepo: Repository<WsReadStatus>,
  ) {}

  /**
   * Procesa el payload del webhook de WhatsApp
   */
  async processWebhook(dto: WhatsAppWebhookDto): Promise<void> {
    this.logger.log('Processing webhook payload');

    for (const entry of dto.entry) {
      for (const change of entry.changes) {
        const { value } = change;

        // Procesar mensajes entrantes
        if (value.messages && value.messages.length > 0) {
          await this.processIncomingMessages(value.messages, value.contacts, JSON.stringify(dto));
        }

        // Procesar cambios de estado de mensajes
        if (value.statuses && value.statuses.length > 0) {
          await this.processMessageStatuses(value.statuses, JSON.stringify(dto));
        }

        // Procesar errores
        if (value.errors && value.errors.length > 0) {
          await this.processErrors(value.errors, JSON.stringify(dto));
        }
      }
    }
  }

  /**
   * Procesa mensajes entrantes
   */
  private async processIncomingMessages(
    messages: any[],
    contacts: any[] | undefined,
    rawPayload: string,
  ): Promise<void> {
    for (const msg of messages) {
      try {
        // Buscar nombre del contacto
        const contact = contacts?.find((c) => c.wa_id === msg.from);
        const contactName = contact?.profile?.name || undefined;

        // Determinar tipo y contenido del mensaje
        const messageType = this.getMessageType(msg.type);
        let messageText: string | null | undefined;
        let mediaUrl: string | null | undefined;
        let mediaId: string | null | undefined;
        let mediaMimeType: string | null | undefined;

        if (msg.type === 'text' && msg.text) {
          messageText = msg.text.body;
        } else if (msg.type === 'image' && msg.image) {
          mediaId = msg.image.id;
          mediaMimeType = msg.image.mime_type;
          if (msg.image.caption) messageText = msg.image.caption;
        } else if (msg.type === 'audio' && msg.audio) {
          mediaId = msg.audio.id;
          mediaMimeType = msg.audio.mime_type;
        } else if (msg.type === 'video' && msg.video) {
          mediaId = msg.video.id;
          mediaMimeType = msg.video.mime_type;
        } else if (msg.type === 'document' && msg.document) {
          mediaId = msg.document.id;
          mediaMimeType = msg.document.mime_type;
          if (msg.document.filename) messageText = msg.document.filename;
        } else if (msg.type === 'location' && msg.location) {
          messageText = JSON.stringify(msg.location);
        } else if (msg.type === 'contacts' && msg.contacts) {
          messageText = JSON.stringify(msg.contacts);
        }

        // Verificar si el mensaje ya existe
        const existing = await this.incomingMessageRepo.findOne({
          where: { whatsapp_message_id: msg.id },
        });

        if (!existing) {
          const incomingMessage = new WsIncomingMessage();
          incomingMessage.whatsapp_message_id = msg.id;
          incomingMessage.phone_from = msg.from;
          incomingMessage.contact_name = contactName;
          incomingMessage.message_type = messageType;
          incomingMessage.message_text = messageText;
          incomingMessage.media_url = mediaUrl;
          incomingMessage.media_id = mediaId;
          incomingMessage.media_mime_type = mediaMimeType;
          incomingMessage.timestamp = parseInt(msg.timestamp, 10);
          incomingMessage.status = 'received' as MessageStatus;
          incomingMessage.raw_payload = rawPayload;

          await this.incomingMessageRepo.save(incomingMessage);
          this.logger.log(`Saved incoming message ${msg.id} from ${msg.from}`);
        } else {
          this.logger.log(`Message ${msg.id} already exists, skipping`);
        }
      } catch (error) {
        this.logger.error(`Error processing incoming message: ${error.message}`, error.stack);
      }
    }
  }

  /**
   * Procesa cambios de estado de mensajes
   */
  private async processMessageStatuses(statuses: any[], rawPayload: string): Promise<void> {
    for (const status of statuses) {
      try {
        // Buscar evento existente por whatsapp_message_id
        let event = await this.webhookEventRepo.findOne({
          where: { whatsapp_message_id: status.id },
        });

        if (event) {
          // Actualizar el estado existente (progresión: sent → delivered → read)
          event.message_status = status.status as MessageStatusValue;
          event.timestamp = parseInt(status.timestamp, 10);
          event.raw_payload = rawPayload;
          event.error_details = status.errors ? JSON.stringify(status.errors) : undefined;
          this.logger.log(`Updated status for message ${status.id}: ${status.status}`);
        } else {
          // Crear nuevo registro si no existe
          event = this.webhookEventRepo.create({
            event_type: 'message_status' as WebhookEventType,
            whatsapp_message_id: status.id,
            phone_number: status.recipient_id,
            message_status: status.status as MessageStatusValue,
            timestamp: parseInt(status.timestamp, 10),
            raw_payload: rawPayload,
            error_details: status.errors ? JSON.stringify(status.errors) : undefined,
          });
          this.logger.log(`Created status event for message ${status.id}: ${status.status}`);
        }

        await this.webhookEventRepo.save(event);
      } catch (error) {
        this.logger.error(`Error processing status: ${error.message}`, error.stack);
      }
    }
  }

  /**
   * Procesa errores del webhook
   */
  private async processErrors(errors: any[], rawPayload: string): Promise<void> {
    for (const error of errors) {
      try {
        const event = this.webhookEventRepo.create({
          event_type: 'other' as WebhookEventType,
          raw_payload: rawPayload,
          error_details: JSON.stringify(error),
          timestamp: Date.now(),
        });

        await this.webhookEventRepo.save(event);
        this.logger.error(`Saved error event: ${error.title || error.message}`);
      } catch (err) {
        this.logger.error(`Error saving error event: ${err.message}`, err.stack);
      }
    }
  }

  /**
   * Determina el tipo de mensaje
   */
  private getMessageType(type: string): MessageType {
    const validTypes: MessageType[] = ['text', 'image', 'audio', 'video', 'document', 'location', 'contacts'];
    return validTypes.includes(type as MessageType) ? (type as MessageType) : 'unknown';
  }

  /**
   * Obtiene mensajes entrantes con paginación y filtro por fecha
   * @param from fecha inicio formato DD/MM/YYYY
   * @param to fecha fin formato DD/MM/YYYY
   */
  async getIncomingMessages(
    page = 1,
    limit = 50,
    from?: string,
    to?: string,
  ): Promise<{ data: WsIncomingMessage[]; total: number }> {
    const qb = this.incomingMessageRepo.createQueryBuilder('msg');

    // Filtrar por rango de fechas si se proveen
    if (from && to) {
      const [fromDay, fromMonth, fromYear] = from.split('/');
      const [toDay, toMonth, toYear] = to.split('/');
      const fromDate = new Date(parseInt(fromYear), parseInt(fromMonth) - 1, parseInt(fromDay), 0, 0, 0);
      const toDate = new Date(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay), 23, 59, 59);
      qb.where('msg.created_at >= :fromDate', { fromDate });
      qb.andWhere('msg.created_at <= :toDate', { toDate });
    }

    qb.orderBy('msg.created_at', 'DESC');
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  /**
   * Obtiene mensajes por teléfono
   */
  async getMessagesByPhone(phone: string): Promise<WsIncomingMessage[]> {
    return this.incomingMessageRepo.find({
      where: { phone_from: phone },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Obtiene eventos del webhook con paginación y filtro por fecha
   * SOLO muestra el ÚLTIMO estado de cada mensaje (no duplicados)
   * @param from fecha inicio formato DD/MM/YYYY
   * @param to fecha fin formato DD/MM/YYYY
   */
  async getWebhookEvents(
    page = 1,
    limit = 50,
    from?: string,
    to?: string,
  ): Promise<{ data: WsWebhookEvent[]; total: number }> {
    // Usar raw SQL con DISTINCT ON (soportado por PostgreSQL)
    let whereClause = '';
    const params: any[] = [];
    
    if (from && to) {
      const [fromDay, fromMonth, fromYear] = from.split('/');
      const [toDay, toMonth, toYear] = to.split('/');
      const fromDate = new Date(parseInt(fromYear), parseInt(fromMonth) - 1, parseInt(fromDay), 0, 0, 0);
      const toDate = new Date(parseInt(toYear), parseInt(toMonth) - 1, parseInt(toDay), 23, 59, 59);
      whereClause = ` WHERE evt.created_at >= $1 AND evt.created_at <= $2`;
      params.push(fromDate, toDate);
    }
    
    // Query para datos con DISTINCT ON + JOINs para traer el contenido del mensaje
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        sub.*,
        COALESCE(msg_exact.message_text, msg_phone.message_text, hist.payload_snapshot) as message_text,
        COALESCE(msg_exact.contact_name, msg_phone.contact_name, hist.nombre) as message_contact_name,
        hist.tipo as template_tipo,
        hist.source_id as template_source_id
      FROM (
        SELECT DISTINCT ON (evt.whatsapp_message_id) evt.*
        FROM ws_webhook_events evt
        ${whereClause}
        ORDER BY evt.whatsapp_message_id, evt.created_at DESC
      ) sub
      LEFT JOIN ws_incoming_messages msg_exact ON msg_exact.whatsapp_message_id = sub.whatsapp_message_id
      LEFT JOIN LATERAL (
        SELECT message_text, contact_name 
        FROM ws_incoming_messages 
        WHERE phone_from = sub.phone_number 
        ORDER BY created_at DESC 
        LIMIT 1
      ) msg_phone ON msg_exact.whatsapp_message_id IS NULL
      LEFT JOIN LATERAL (
        SELECT payload_snapshot, nombre, tipo, source_id 
        FROM whatsapp_messages 
        WHERE telefono = sub.phone_number 
        ORDER BY created_at DESC 
        LIMIT 1
      ) hist ON msg_exact.whatsapp_message_id IS NULL AND msg_phone.message_text IS NULL
      ORDER BY sub.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);
    
    const data = await this.webhookEventRepo.query(dataQuery, params);
    
    // Query para contar total (sin paginación)
    const countParams = params.slice(0, from && to ? 2 : 0);
    const countQuery = `
      SELECT COUNT(*) as count FROM (
        SELECT DISTINCT ON (whatsapp_message_id) id
        FROM ws_webhook_events evt
        ${whereClause}
        ORDER BY whatsapp_message_id, created_at DESC
      ) sub
    `;
    const countResult = await this.webhookEventRepo.query(countQuery, countParams);
    const total = parseInt(countResult[0]?.count || '0', 10);

    return { data, total };
  }

  /**
   * Obtiene estadísticas generales
   */
  async getStats(): Promise<{
    totalMessages: number;
    totalEvents: number;
    uniquePhones: number;
    messageTypes: Record<string, number>;
    lastUpdate: string;
  }> {
    // Total de mensajes
    const totalMessages = await this.incomingMessageRepo.count();

    // Total de eventos
    const totalEvents = await this.webhookEventRepo.count();

    // Teléfonos únicos
    const uniquePhonesResult = await this.incomingMessageRepo
      .createQueryBuilder('msg')
      .select('COUNT(DISTINCT msg.phone_from)', 'count')
      .getRawOne();
    const uniquePhones = parseInt(uniquePhonesResult?.count || '0', 10);

    // Tipos de mensaje
    const messageTypesResult = await this.incomingMessageRepo
      .createQueryBuilder('msg')
      .select('msg.message_type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('msg.message_type')
      .getRawMany();

    const messageTypes: Record<string, number> = {};
    for (const row of messageTypesResult) {
      messageTypes[row.type] = parseInt(row.count, 10);
    }

    // Último mensaje
    const lastMessage = await this.incomingMessageRepo
      .createQueryBuilder('msg')
      .orderBy('msg.created_at', 'DESC')
      .getOne();

    return {
      totalMessages,
      totalEvents,
      uniquePhones,
      messageTypes,
      lastUpdate: lastMessage?.created_at?.toISOString() || new Date().toISOString(),
    };
  }

  /**
   * Guarda un mensaje enviado por nosotros (para historial completo)
   */
  async saveOutgoingMessage(
    to: string,
    text: string,
    whatsappMessageId?: string,
    contactName?: string,
  ): Promise<void> {
    try {
      const outgoingMessage = this.incomingMessageRepo.create({
        whatsapp_message_id: whatsappMessageId || `sent_${Date.now()}`,
        phone_from: to,
        contact_name: contactName,
        message_type: 'text',
        message_text: text,
        status: 'sent',
        timestamp: Math.floor(Date.now() / 1000),
        raw_payload: JSON.stringify({ type: 'outgoing', to, text }),
        processing_notes: 'Mensaje enviado desde el panel admin',
      });

      await this.incomingMessageRepo.save(outgoingMessage);
      this.logger.log(`Saved outgoing message to ${to}`);
    } catch (error) {
      this.logger.error(`Error saving outgoing message: ${error.message}`, error.stack);
    }
  }

  /**
   * Elimina un mensaje individual por UUID
   */
  async deleteMessage(id: string): Promise<{ deleted: boolean }> {
    // Buscar el mensaje para obtener el whatsapp_message_id
    const message = await this.incomingMessageRepo.findOne({ where: { id } });
    if (!message) {
      return { deleted: false };
    }

    // Eliminar evento de webhook asociado si existe
    if (message.whatsapp_message_id) {
      await this.webhookEventRepo.delete({ whatsapp_message_id: message.whatsapp_message_id });
    }

    // Eliminar el mensaje
    await this.incomingMessageRepo.delete({ id });
    this.logger.log(`Deleted message ${id} (wa_id: ${message.whatsapp_message_id})`);
    return { deleted: true };
  }

  /**
   * Elimina toda una conversación (todos los mensajes de un teléfono)
   */
  async deleteConversation(phone: string): Promise<{ deletedMessages: number; deletedEvents: number }> {
    // Contar antes de borrar
    const msgCount = await this.incomingMessageRepo.count({ where: { phone_from: phone } });

    // Obtener whatsapp_message_ids para borrar eventos asociados
    const messages = await this.incomingMessageRepo.find({
      where: { phone_from: phone },
      select: ['whatsapp_message_id'],
    });
    const waIds = messages.map(m => m.whatsapp_message_id).filter(Boolean);

    // Borrar eventos de webhook
    let evtCount = 0;
    if (waIds.length > 0) {
      const evtResult = await this.webhookEventRepo
        .createQueryBuilder()
        .delete()
        .where('whatsapp_message_id IN (:...ids)', { ids: waIds })
        .execute();
      evtCount = evtResult.affected ?? 0;
    }
    // También borrar eventos por phone_number
    const evtResult2 = await this.webhookEventRepo
      .createQueryBuilder()
      .delete()
      .where('phone_number = :phone', { phone })
      .execute();
    evtCount += evtResult2.affected ?? 0;

    // Borrar mensajes
    await this.incomingMessageRepo.delete({ phone_from: phone });

    // Borrar estado de lectura
    await this.readStatusRepo.delete({ phone });

    this.logger.log(`Deleted conversation ${phone}: ${msgCount} messages, ${evtCount} events`);
    return { deletedMessages: msgCount, deletedEvents: evtCount };
  }

  /**
   * Registra que un adminleó esta conversación hasta el timestamp dado.
   * Usa upsert para actualizar si ya existe el registro.
   */
  async markRead(phone: string, readerEmail: string, lastSeenAt: number): Promise<void> {
    await this.readStatusRepo
      .createQueryBuilder()
      .insert()
      .into(WsReadStatus)
      .values({ phone, reader_email: readerEmail, last_seen_at: lastSeenAt })
      .orUpdate(['last_seen_at', 'updated_at'], ['phone', 'reader_email'])
      .execute();
    this.logger.log(`Mark read: ${readerEmail} → ${phone} @ ${lastSeenAt}`);
  }

  /**
   * Retorna el mapa phone → last_seen_at para un reader_email dado.
   * Usado por el frontend para pre-cargar el estado de leídos al iniciar sesión.
   */
  async getReadStatus(readerEmail: string): Promise<Record<string, number>> {
    const rows = await this.readStatusRepo.find({ where: { reader_email: readerEmail } });
    const result: Record<string, number> = {};
    for (const row of rows) {
      result[row.phone] = Number(row.last_seen_at);
    }
    return result;
  }
}
