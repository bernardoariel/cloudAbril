import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { WhatsappHistoryService } from './whatsapp-history.service';
import {
  RegisterWhatsappMessageDto,
  ListWhatsappMessagesQueryDto,
} from './dto/register-whatsapp-message.dto';

@Controller('whatsapp-history')
export class WhatsappHistoryController {
  constructor(
    private readonly historyService: WhatsappHistoryService,
  ) {}

  /**
   * Registrar un mensaje (intento de envío) en el historial.
   * Usar esto ANTES de llamar a Meta para saber si ya se envió.
   */
  @Post('messages')
  async registerMessage(@Body() dto: RegisterWhatsappMessageDto) {
    const result = await this.historyService.registerMessage({
      tipo: dto.tipo,
      sourceSystem: dto.sourceSystem,
      sourceId: dto.sourceId,
      externalClientId: dto.externalClientId,
      nombre: dto.nombre,
      telefono: dto.telefono,
      payloadSnapshot: dto.payloadSnapshot,
    });

    if (result.alreadyExists) {
      return {
        code: 'ALREADY_EXISTS',
        message: 'Ya existe un mensaje registrado para este evento',
        data: result.message,
      };
    }

    return {
      code: 'CREATED',
      message: 'Mensaje registrado correctamente',
      data: result.message,
    };
  }

  /**
   * Listar mensajes con filtros simples
   * Ej:
   *  GET /whatsapp-history/messages?externalClientId=123&tipo=aviso_compra
   */
  @Get('messages')
  async listMessages(@Query() query: ListWhatsappMessagesQueryDto) {
    const qb = this.historyService['messageRepo'].createQueryBuilder('m')
      .leftJoinAndSelect('m.client', 'c')
      .orderBy('m.created_at', 'DESC')
      .take(200); // límite razonable

    if (query.tipo) {
      qb.andWhere('m.tipo = :tipo', { tipo: query.tipo });
    }
    if (query.externalClientId) {
      qb.andWhere('c.external_client_id = :extId', { extId: query.externalClientId });
    }
    if (query.sourceId) {
      qb.andWhere('m.source_id = :sourceId', { sourceId: query.sourceId });
    }
    if (query.status) {
      qb.andWhere('m.message_status = :status', { status: query.status });
    }

    const items = await qb.getMany();
    return { items };
  }

  /**
   * Obtener un mensaje puntual por ID
   */
  @Get('messages/:id')
  async getMessage(@Param('id') id: string) {
    const msg = await this.historyService['messageRepo'].findOne({
      where: { id },
      relations: ['client'],
    });

    return msg;
  }
}
