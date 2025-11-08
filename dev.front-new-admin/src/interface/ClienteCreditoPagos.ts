export interface ClienteCreditoPagos {
  codCredito:          string;
  cantidadCuotas:      number;
  cuotasPagadas:       number;
  cuotasPendientes:    number;
  cuotasVencidas:      number;
  montoTotalCredito:   number;
  montoPagado:         number;
  montoPendiente:      number;
  proximaCuotaVencida: null;
  detalle:             Detalle[];
}

export interface Detalle {
  nroCuota:         number;
  codCredito:       string;
  monCuoCap:        number;
  intFinCuo:        number;
  ivaFinCuo:        number;
  cuotaTotal:       number;
  fechaVencimiento: Date;
  vencida:          boolean;
  diasVencida:      number;
  pagada:           boolean;
  estado:           Estado;
  codReciboOf:      string;
  fechaPago:        null;
  detallesPago:     DetallesPago;
}

export interface DetallesPago {
  idPago:                 number;
  montoCapitalPagado:     number;
  interesPagado:          number;
  ivaPagado:              number;
  interesPunitorioPagado: number;
  ivaPunitorioPagado:     number;
  totalPagado:            number;
  bonificacion:           number;
}

export enum Estado {
  Pagada = "PAGADA",
}
