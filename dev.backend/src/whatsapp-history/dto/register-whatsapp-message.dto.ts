import { IsString, IsIn, IsOptional, IsNotEmpty } from 'class-validator';
import { TipoMensaje } from '../entities/whatsapp-message.entity';

export class RegisterWhatsappMessageDto {
  @IsIn(['aviso_compra', 'aviso_pago', 'reclamo_pago'])
  tipo: TipoMensaje;

  @IsString()
  @IsNotEmpty()
  sourceSystem: string;        // 'VENTA' | 'PAGO' | etc.

  @IsString()
  @IsNotEmpty()
  sourceId: string;            // CodVenta, CodRecibo, etc.

  @IsString()
  @IsNotEmpty()
  externalClientId: string;    // IdCliente, DNI, lo que uses como referencia

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  telefono: string;

  @IsOptional()
  payloadSnapshot?: any;       // opcional: objeto con totales, productos, etc.
}

export class ListWhatsappMessagesQueryDto {
  @IsOptional()
  @IsIn(['aviso_compra', 'aviso_pago', 'reclamo_pago'])
  tipo?: TipoMensaje;

  @IsOptional()
  @IsString()
  externalClientId?: string;

  @IsOptional()
  @IsString()
  sourceId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
