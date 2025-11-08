export interface ClienteCredito {
  CodSucCred:        number;
  CodCredito:        string;
  CodCliente:        number;
  CodVenta:          string;
  Fecha:             Date;
  MontoCapital:      number;
  SaldoCapital:      number;
  CantCuotas:        number;
  CuotaCapital:      number;
  TasaIntMen:        number;
  IntMenCuota:       number;
  GastosAdm:         number | null;
  IntPunitorio:      number;
  FechaPPago:        Date;
  Observacion:       null;
  EmitiRecibo:       boolean;
  Estado:            Estado;
  CodCobrador:       number;
  CodGarante:        null | string;
  InformeCom:        number | null;
  Afectado:          null;
  FechaAfect:        null;
  FecPagare:         null;
  PagEntregadoA:     null;
  Auditar:           boolean | null;
  Mora:              number;
  ProMora:           number | null;
  ControlF:          null;
  DocGarante:        null;
  Refinancio:        null;
  CreditoRef:        null;
  MotivoRef:         null;
  SucAnterior:       null;
  CodGarante2:       null | string;
  CreditoObservado:  null;
  CreditoControlado: boolean;
  CreditoRecibido:   boolean;
  Comentarios:       null;
  Intereses:         number | null;
  IVAIntereses:      number | null;
  Autor_Inmediata:   boolean | null;
  Hora:              null;
  Credito_Origen:    null;
  CodComercio:       number;
  CreditoPresentado: null;
  CreditoLiquidado:  null;
  Comision_Comercio: null;
  EstadoCredito:     number;
  AutorizacionExt:   null;
  ESTADO_ANT:        Estado | null;
  codReciboPr: string;
}

export enum Estado {
  C = "C",
}
