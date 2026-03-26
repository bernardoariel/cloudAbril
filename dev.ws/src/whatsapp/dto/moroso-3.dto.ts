import { IsString } from 'class-validator';

export class Moroso3Dto {
  @IsString() to: string;

  @IsString() fecha: string;
  @IsString() nombre: string;
  @IsString() nro_cuenta: string;
  @IsString() importe: string;
}
