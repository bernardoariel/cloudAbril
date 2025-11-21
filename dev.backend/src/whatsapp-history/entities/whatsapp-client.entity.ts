// src/whatsapp-history/entities/whatsapp-client.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { WhatsappMessage  } from './whatsapp-message.entity';

@Entity('whatsapp_clients')
export class WhatsappClient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del cliente en el sistema de ventas / pagos (puede ser DNI o IdCliente)
  @Column({ type: 'varchar', length: 50 })
  external_client_id: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  documento?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telefono_normalizado?: string;

  @OneToMany(() => WhatsappMessage, (msg) => msg.client)
  messages: WhatsappMessage[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
