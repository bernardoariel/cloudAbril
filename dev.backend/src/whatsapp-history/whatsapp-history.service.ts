// src/whatsapp-history/whatsapp-history.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { WhatsappClient } from './entities/whatsapp-client.entity';
import { WhatsappMessage, TipoMensaje } from './entities/whatsapp-message.entity';

@Injectable()
export class WhatsappHistoryService {
  constructor(
    @InjectRepository(WhatsappClient, 'postgresConnection')
    private readonly clientRepo: Repository<WhatsappClient>,
    @InjectRepository(WhatsappMessage, 'postgresConnection')
    private readonly messageRepo: Repository<WhatsappMessage>,
  ) {}

  private generateUniqueKey(tipo: TipoMensaje, sourceId: string) {
    return crypto
      .createHash('sha1')
      .update(`${tipo}:${sourceId}`)
      .digest('hex');
  }

  async findOrCreateClient(externalId: string, nombre: string, documento?: string, telefono?: string) {
    let client = await this.clientRepo.findOne({ where: { external_client_id: externalId } });

    if (!client) {
      client = this.clientRepo.create({
        external_client_id: externalId,
        nombre,
        documento,
        telefono_normalizado: telefono,
      });
      client = await this.clientRepo.save(client);
    }

    return client;
  }

  /**
   * Registra un intento de envío (compra/pago) evitando duplicados
   */
  async registerMessage(params: {
    tipo: TipoMensaje;
    sourceSystem: string;     // 'VENTA' | 'PAGO'
    sourceId: string;         // CodVenta / CodRecibo
    externalClientId: string; // IdCliente o DNI
    nombre: string;
    telefono: string;
    payloadSnapshot?: any;
  }) {
    const uniqueKey = this.generateUniqueKey(params.tipo, params.sourceId);

    // ya existe → no volver a registrar
    const existing = await this.messageRepo.findOne({ where: { unique_key: uniqueKey } });
    if (existing) {
      return { alreadyExists: true, message: existing };
    }

    const client = await this.findOrCreateClient(
      params.externalClientId,
      params.nombre,
      undefined,
      params.telefono,
    );

    const message = this.messageRepo.create({
      clientId: client.id,
      tipo: params.tipo,
      source_system: params.sourceSystem,
      source_id: params.sourceId,
      telefono: params.telefono,
      nombre: params.nombre,
      message_status: 'queued',
      unique_key: uniqueKey,
      payload_snapshot: params.payloadSnapshot
        ? JSON.stringify(params.payloadSnapshot)
        : null,
    });

    const saved = await this.messageRepo.save(message);
    return { alreadyExists: false, message: saved };
  }
}
