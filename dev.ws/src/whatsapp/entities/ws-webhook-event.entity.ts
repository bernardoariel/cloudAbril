// Entidad para almacenar eventos del webhook de WhatsApp (estados de mensajes enviados, etc)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type WebhookEventType = 'message' | 'message_status' | 'other';
export type MessageStatusValue = 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';

@Entity('ws_webhook_events')
@Index(['event_type'])
@Index(['whatsapp_message_id'])
@Index(['created_at'])
export class WsWebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Tipo de evento
  @Column({ type: 'varchar', length: 50 })
  event_type: WebhookEventType;

  // ID del mensaje de WhatsApp (si aplica)
  @Column({ type: 'varchar', length: 255, nullable: true })
  whatsapp_message_id?: string;

  // Teléfono relacionado
  @Column({ type: 'varchar', length: 30, nullable: true })
  phone_number?: string;

  // Estado del mensaje (sent, delivered, read, failed)
  @Column({ type: 'varchar', length: 20, nullable: true })
  message_status?: MessageStatusValue;

  // Timestamp del evento
  @Column({ type: 'bigint', nullable: true })
  timestamp?: number;

  // Payload completo del webhook (JSON)
  @Column({ type: 'text' })
  raw_payload: string;

  // Errores si los hay
  @Column({ type: 'text', nullable: true })
  error_details?: string;

  @CreateDateColumn()
  created_at: Date;
}
