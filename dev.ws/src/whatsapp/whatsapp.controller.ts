import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';

import { AvisoCompraDto } from './dto/aviso-compra.dto';
import { AvisoPagoDto } from './dto/aviso-pago.dto';
import { WhatsAppService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsAppController {
  constructor(private readonly wsService: WhatsAppService) { }

  @Post('aviso_compra_abril')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendAvisoCompra(@Body() b: AvisoCompraDto) {
    return this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'aviso_compra_abril',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'cod_venta', text: b.cod_venta },
              { type: 'text', parameter_name: 'fecha_compra', text: b.fecha_compra },
              { type: 'text', parameter_name: 'documento', text: b.documento },
              { type: 'text', parameter_name: 'product_list', text: b.product_list },
              { type: 'text', parameter_name: 'pago_list', text: b.pago_list },
            ],
          },
        ],
      },
    });
  }

  @Post('aviso_pago_abril')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async sendAvisoPago(@Body() b: AvisoPagoDto) {
    return this.wsService.sendTemplate({
      to: b.to,
      template: {
        name: 'aviso_pago_abril',
        language: { code: 'es_AR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', parameter_name: 'nombre', text: b.nombre },
              { type: 'text', parameter_name: 'nro_operacion', text: b.nro_operacion },
              { type: 'text', parameter_name: 'nro_recibo', text: b.nro_recibo },
              { type: 'text', parameter_name: 'fecha', text: b.fecha },
              { type: 'text', parameter_name: 'documento', text: b.documento },
              { type: 'text', parameter_name: 'nombre_sucursal', text: b.nombre_sucursal },
              { type: 'text', parameter_name: 'importe', text: b.importe },
            ],
          },
        ],
      },
    });
  }
}
