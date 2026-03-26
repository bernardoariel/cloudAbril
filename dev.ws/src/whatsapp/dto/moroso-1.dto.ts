import { IsString } from 'class-validator';

export class Moroso1Dto {
  @IsString() to: string;

  @IsString() cliente: string;
  @IsString() nro_cuenta: string;
  @IsString() importe: string;
  @IsString() fecha_max_pago: string;
}
