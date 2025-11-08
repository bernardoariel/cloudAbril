export interface Recibo {
  codSucRecibo: number;
  codReciboPr: string;
  codCredito: string;
  fecha: string;
  montoPagado: number;
  codCobrador: number;
  observacion: string;
  mAtrazo: number;
  saldoReal: number;
  usuario: string;
  estado: string;
  fechaImpresion: string;
  tipo: string;
  codAsientoRec: number;
  codForPago: string;
  // Campos que se agregarán después
  nombre?: string;
  telefonos?: string;
} 