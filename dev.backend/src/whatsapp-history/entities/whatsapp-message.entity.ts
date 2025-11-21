// src/whatsapp-history/entities/whatsapp-message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
  JoinColumn,
} from 'typeorm';
import { WhatsappClient } from './whatsapp-client.entity';

export type TipoMensaje = 'aviso_compra' | 'aviso_pago' | 'reclamo_pago';
export type EstadoMensaje = 'queued' | 'sent' | 'failed' | 'suppressed';

@Entity('whatsapp_messages')
@Index(['unique_key'], { unique: true })
export class WhatsappMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WhatsappClient, (client) => client.messages, { eager: true })
  @JoinColumn({ name: 'client_id' })
  client: WhatsappClient;

  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  // aviso_compra | aviso_pago | reclamo_pago
  @Column({ type: 'varchar', length: 30 })
  tipo: TipoMensaje;

  // desde qué sistema viene el evento: VENTA / PAGO / etc
  @Column({ type: 'varchar', length: 30 })
  source_system: string;

  // id de la venta, recibo, crédito, etc del otro sistema
  @Column({ type: 'varchar', length: 50 })
  source_id: string;

  // Teléfono al que efectivamente se envió
  @Column({ type: 'varchar', length: 30 })
  telefono: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  // estado del mensaje: queued / sent / failed / suppressed
  @Column({ type: 'varchar', length: 20, nullable: true })
  message_status: EstadoMensaje;

  // id que devuelve Meta (si aplica)
  @Column({ type: 'varchar', length: 255, nullable: true })
  whatsapp_message_id: string;

  // Respuesta cruda del proveedor (JSON como string)
  @Column({ type: 'text', nullable: true })
  response: string;

  // Snapshot opcional (productos, montos, etc) en JSON
  @Column({ type: 'text', nullable: true })
  payload_snapshot: string;

  // clave única para no repetir mensajes (ej: sha1('aviso_compra:01036953'))
  @Column({ type: 'varchar', length: 120 })
  unique_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
