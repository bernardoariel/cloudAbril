import { IsString, IsOptional, IsIn } from 'class-validator';

export class CreateWhatsAppMessageDto {
  @IsString()
  @IsIn(['aviso_compra', 'aviso_pago'])
  tipo: 'aviso_compra' | 'aviso_pago';

  @IsString()
  telefono: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  cod_venta?: string;

  @IsOptional()
  @IsString()
  nro_recibo?: string;

  @IsOptional()
  response?: any; // Puede ser object o string

  @IsOptional()
  @IsString()
  message_status?: string;

  @IsOptional()
  @IsString()
  whatsapp_message_id?: string;
}
