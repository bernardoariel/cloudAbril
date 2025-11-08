export interface Venta {
  venta_CodVenta: string;
  venta_Fecha: string;
  venta_Total: number;
  venta_FormaPago: string;
  venta_Estado: string;
  Nombre: string;
  NombreCont: string;
  ApellidoCont: string;
  CodSucursal: number;
  NroDoc: number;
  Telefonos: string;
}

export interface MetodoPagoVenta {
  CodSucursal: number;
  CodMetPagos: number;
  CodVenta: string;
  CodForPago: string;
  Estado: boolean;
  Tipo: string;
  Importe: number;
  CodSucFondo: number | null;
  CodMovFondo: number | null;
  Id_Operador: number | null;
  Id_Registro: number;
  Id_Turno: number;
  Capital: number;
  Id_Ejercicio: number | null;
} 