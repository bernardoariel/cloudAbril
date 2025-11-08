import { IsString } from 'class-validator';

export class AvisoPagoDto {
    @IsString() to: string;

    @IsString() nombre: string;
    @IsString() nro_operacion: string;
    @IsString() nro_recibo: string;
    @IsString() fecha: string;
    @IsString() documento: string;
    @IsString() nombre_sucursal: string;
    @IsString() importe: string;
}
