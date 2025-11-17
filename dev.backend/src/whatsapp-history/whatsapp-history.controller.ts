import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { WhatsappHistoryService } from './whatsapp-history.service';
import { CreateWhatsAppMessageDto } from './dto/create-whatsapp-message.dto';

@Controller('whatsapp-history')
export class WhatsappHistoryController {
  constructor(private readonly whatsappHistoryService: WhatsappHistoryService) {}

  @Post()
  async create(@Body() createWhatsAppMessageDto: CreateWhatsAppMessageDto) {
    return await this.whatsappHistoryService.create(createWhatsAppMessageDto);
  }

  @Get()
  async findAll() {
    return await this.whatsappHistoryService.findAll();
  }

  @Get('stats')
  async getStats() {
    return await this.whatsappHistoryService.getStats();
  }

  @Get('recent')
  async findRecent(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 50;
    return await this.whatsappHistoryService.findRecent(limitNumber);
  }

  @Get('tipo/:tipo')
  async findByTipo(@Param('tipo') tipo: 'aviso_compra' | 'aviso_pago') {
    return await this.whatsappHistoryService.findByTipo(tipo);
  }

  @Get('telefono/:telefono')
  async findByTelefono(@Param('telefono') telefono: string) {
    return await this.whatsappHistoryService.findByTelefono(telefono);
  }

  @Get('check/:tipo/:telefono/:codigo')
  async checkIfExists(
    @Param('tipo') tipo: 'aviso_compra' | 'aviso_pago',
    @Param('telefono') telefono: string,
    @Param('codigo') codigo: string
  ) {
    const message = await this.whatsappHistoryService.findByTelefonoAndCodigo(tipo, telefono, codigo);
    return {
      exists: !!message,
      message: message
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.whatsappHistoryService.remove(id);
    return { message: 'Mensaje eliminado correctamente' };
  }
}
