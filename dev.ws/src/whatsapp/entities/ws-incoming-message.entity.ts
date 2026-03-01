// Entidad para almacenar mensajes entrantes del webhook de WhatsApp
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contacts' | 'unknown';
export type MessageStatus = 'received' | 'sent' | 'processed' | 'failed';

@Entity('ws_incoming_messages')
@Index(['whatsapp_message_id'], { unique: true })
@Index(['phone_from'])
@Index(['created_at'])
export class WsIncomingMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del mensaje de WhatsApp (único)
  @Column({ type: 'varchar', length: 255, unique: true })
  whatsapp_message_id: string;

  // Teléfono del remitente (formato internacional)
  @Column({ type: 'varchar', length: 30 })
  phone_from: string;

  // Nombre del contacto (si está disponible)
  @Column({ type: 'varchar', length: 255, nullable: true })
  contact_name?: string | null;

  // Tipo de mensaje (text, image, audio, etc)
  @Column({ type: 'varchar', length: 20 })
  message_type: MessageType;

  // Contenido del mensaje (texto)
  @Column({ type: 'text', nullable: true })
  message_text?: string | null;

  // URL del media (si aplica)
  @Column({ type: 'text', nullable: true })
  media_url?: string | null;

  // ID del media en WhatsApp
  @Column({ type: 'varchar', length: 255, nullable: true })
  media_id?: string | null;

  // Mime type del archivo
  @Column({ type: 'varchar', length: 100, nullable: true })
  media_mime_type?: string | null;

  // Timestamp del mensaje (cuando se envió)
  @Column({ type: 'bigint' })
  timestamp: number;

  // Estado del procesamiento
  @Column({ type: 'varchar', length: 20, default: 'received' })
  status: MessageStatus;

  // Payload completo del webhook (JSON)
  @Column({ type: 'text' })
  raw_payload: string;

  // Notas o errores de procesamiento
  @Column({ type: 'text', nullable: true })
  processing_notes?: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
