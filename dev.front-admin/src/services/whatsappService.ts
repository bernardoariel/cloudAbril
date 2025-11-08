// src/services/whatsappService.ts
import { WHATSAPP_BASE_URL } from '@/common/config';

export interface AvisoCompraPayload {
  to: string;
  nombre: string;
  cod_venta: string;
  fecha_compra: string;
  documento: string;
  product_list: string;
  pago_list: string;
}

export interface AvisoPagoPayload {
  to: string;
  nombre: string;
  nro_operacion: string;
  nro_recibo: string;
  fecha: string;
  documento: string;
  nombre_sucursal: string;
  importe: string;
}

class WhatsappService {
  private baseUrl = WHATSAPP_BASE_URL ?? 'http://localhost:3010';

  async sendAvisoCompra(data: AvisoCompraPayload) {
    return this.post(`${this.baseUrl}/whatsapp/aviso_compra_abril`, data);
  }

  async sendAvisoPago(data: AvisoPagoPayload) {
    return this.post(`${this.baseUrl}/whatsapp/aviso_pago_abril`, data);
  }

  private async post(url: string, data: any) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error HTTP: ${res.status} - ${text}`);
      }

      return await res.json();
    } catch (err) {
      console.error('Error enviando WhatsApp:', err);
      throw err;
    }
  }
}

export const whatsappService = new WhatsappService();
