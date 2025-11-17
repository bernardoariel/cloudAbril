import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('whatsapp_messages')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  tipo: 'aviso_compra' | 'aviso_pago';

  @Column({ type: 'varchar', length: 20 })
  telefono: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  cod_venta?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nro_recibo?: string;

  @Column({ type: 'text', nullable: true })
  response: string; // JSON almacenado como string

  @Column({ type: 'varchar', length: 20, nullable: true })
  message_status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  whatsapp_message_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
