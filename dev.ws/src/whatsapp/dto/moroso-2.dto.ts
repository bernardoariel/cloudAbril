import { IsString } from 'class-validator';

export class Moroso2Dto {
  @IsString() to: string;

  @IsString() nombre: string;
  @IsString() nro_cuenta: string;
  @IsString() importe: string;
}
