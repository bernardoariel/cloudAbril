import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';
import { CreateWhatsAppMessageDto } from './dto/create-whatsapp-message.dto';

@Injectable()
export class WhatsappHistoryService {
  constructor(
    @InjectRepository(WhatsAppMessage, 'postgresConnection')
    private whatsappMessageRepository: Repository<WhatsAppMessage>,
  ) {}

  async create(createWhatsAppMessageDto: CreateWhatsAppMessageDto): Promise<WhatsAppMessage> {
    // Si response es un objeto, convertirlo a string
    const dto = { ...createWhatsAppMessageDto };
    if (dto.response && typeof dto.response === 'object') {
      dto.response = JSON.stringify(dto.response);
    }
    
    const message = this.whatsappMessageRepository.create(dto);
    return await this.whatsappMessageRepository.save(message);
  }

  async findAll(): Promise<WhatsAppMessage[]> {
    const messages = await this.whatsappMessageRepository.find({
      order: { created_at: 'DESC' }
    });
    
    return this.parseResponseFields(messages);
  }

  async findByTelefonoAndCodigo(
    tipo: 'aviso_compra' | 'aviso_pago',
    telefono: string,
    codigo: string
  ): Promise<WhatsAppMessage | null> {
    const whereCondition = tipo === 'aviso_compra' 
      ? { tipo, telefono, cod_venta: codigo }
      : { tipo, telefono, nro_recibo: codigo };

    const message = await this.whatsappMessageRepository.findOne({
      where: whereCondition
    });

    if (message && message.response) {
      message.response = this.parseJson(message.response) as any;
    }

    return message;
  }

  async findByTipo(tipo: 'aviso_compra' | 'aviso_pago'): Promise<WhatsAppMessage[]> {
    const messages = await this.whatsappMessageRepository.find({
      where: { tipo },
      order: { created_at: 'DESC' }
    });
    
    return this.parseResponseFields(messages);
  }

  async findRecent(limit: number = 50): Promise<WhatsAppMessage[]> {
    const messages = await this.whatsappMessageRepository.find({
      order: { created_at: 'DESC' },
      take: limit
    });
    
    return this.parseResponseFields(messages);
  }

  async findByTelefono(telefono: string): Promise<WhatsAppMessage[]> {
    const messages = await this.whatsappMessageRepository.find({
      where: { telefono },
      order: { created_at: 'DESC' }
    });
    
    return this.parseResponseFields(messages);
  }

  async remove(id: string): Promise<void> {
    await this.whatsappMessageRepository.delete(id);
  }

  async getStats(): Promise<any> {
    const total = await this.whatsappMessageRepository.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await this.whatsappMessageRepository
      .createQueryBuilder('message')
      .where('message.created_at >= :today', { today })
      .getCount();

    const byTipo = await this.whatsappMessageRepository
      .createQueryBuilder('message')
      .select('message.tipo, COUNT(*) as count')
      .groupBy('message.tipo')
      .getRawMany();

    return {
      total,
      today: todayCount,
      byTipo
    };
  }

  // Método helper para parsear campos response de JSON string a object
  private parseResponseFields(messages: WhatsAppMessage[]): WhatsAppMessage[] {
    return messages.map(message => ({
      ...message,
      response: message.response ? this.parseJson(message.response) as any : null
    }));
  }

  private parseJson(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.warn('Error parsing response JSON:', e);
      return jsonString; // Retornar string original si falla
    }
  }
}
