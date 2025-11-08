import type { Sucursales } from './sucursales.interface';

export interface Producto {
  CodProducto: string;
  Producto: string;
  Medida: string;
  Descripcion: string;
  Stock: number;
  CodMarca: number;
  CodRubro: number;
  CodCategoria: number;
  Precio: number;
  Imagen: string;
  Sucursales: Sucursales[];
}
