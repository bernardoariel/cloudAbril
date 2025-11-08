interface AvisoPagoData {
  to: string;
  template: {
    name: string;
    language: { code: string };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        parameter_name: string;
        text: string;
      }>;
    }>;
  };
}

export class WhatsappService {
  private baseUrl = 'http://localhost:3010';

  async sendAvisoPago(data: AvisoPagoData) {
    try {
      const response = await fetch(`${this.baseUrl}/whatsapp/template/aviso_pago`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      throw error;
    }
  }
}

export const whatsappService = new WhatsappService(); 