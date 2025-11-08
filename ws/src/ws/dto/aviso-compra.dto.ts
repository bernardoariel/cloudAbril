import { IsString } from 'class-validator';

export class AvisoCompraDto {
    @IsString() to: string;

    @IsString() nombre: string;
    @IsString() cod_venta: string;
    @IsString() fecha_compra: string;
    @IsString() documento: string;
    @IsString() product_list: string;
    @IsString() pago_list: string;
}