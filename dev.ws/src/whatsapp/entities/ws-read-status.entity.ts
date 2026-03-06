import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/**
 * Tabla que registra hasta qué punto (timestamp) cada admin leyó cada conversación.
 * Clave compuesta: phone + reader_email — un row por (teléfono × usuario admin).
 * Permite que el estado "leído/no leído" sea persistente y compartido entre
 * diferentes dispositivos/oficinas del mismo usuario.
 */
@Entity('ws_read_status')
export class WsReadStatus {
  @PrimaryColumn({ name: 'phone', type: 'varchar', length: 30 })
  phone: string;

  @PrimaryColumn({ name: 'reader_email', type: 'varchar', length: 255 })
  reader_email: string;

  /** Unix timestamp del último mensaje visto por este lector en este chat */
  @Column({ name: 'last_seen_at', type: 'bigint' })
  last_seen_at: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
