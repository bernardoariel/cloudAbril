import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/mercado-pago';

/**
 * Servicio para interactuar con la API de Mercado Pago
 */
export const mercadoPagoService = {
  /**
   * Genera un link de pago para una cuota de crédito
   * @param codCredito Código del crédito
   * @param nroCuota Número de cuota
   * @returns Respuesta con los links de pago y el ID de la preferencia
   */
  async generarLinkPago(codCredito: string, nroCuota: number) {
    try {
      const response = await axios.get(`${API_BASE_URL}/generar-pago/${codCredito}/${nroCuota}`);
      return response.data;
    } catch (error) {
      console.error('Error al generar link de pago:', error);
      throw error;
    }
  },

  /**
   * Crea un pago utilizando el endpoint POST
   * @param codCredito Código del crédito
   * @param nroCuota Número de cuota
   * @returns Respuesta con los links de pago y el ID de la preferencia
   */
  async crearPago(codCredito: string, nroCuota: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/crear-pago`, {
        codCredito,
        nroCuota
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear pago:', error);
      throw error;
    }
  },

  /**
   * Verifica el estado de un pago específico
   * @param pagoId ID de la preferencia de pago
   * @returns Objeto con el estado del pago
   */
  async verificarPago(pagoId: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/verificar-pago/${pagoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar el pago:', error);
      throw error;
    }
  },

  /**
   * Notifica al backend que un pago se ha realizado exitosamente
   * @param codCredito Código del crédito
   * @param nroCuota Número de cuota
   * @param pagoId ID de la preferencia de pago
   * @returns Resultado de la operación
   */
  async confirmarPago(codCredito: string, nroCuota: number, pagoId: string) {
    try {
      const response = await axios.post(`${API_BASE_URL}/confirmar-pago`, {
        codCredito,
        nroCuota,
        pagoId,
        fechaPago: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error('Error al confirmar el pago:', error);
      throw error;
    }
  },

  /**
   * Verifica la disponibilidad del servicio de pagos
   * @returns Estado del servicio
   */
  async verificarServicio() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar el servicio de pagos:', error);
      throw error;
    }
  },

  /**
   * Genera un pago simple sin asociación a la base de datos
   * @param precio Precio del pago (opcional)
   * @returns Respuesta con los links de pago
   */
  async pagoSimple(precio?: number) {
    try {
      const endpoint = precio ? `${API_BASE_URL}/pago-simple/${precio}` : `${API_BASE_URL}/pago-simple`;
      const response = await axios.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('Error al generar pago simple:', error);
      throw error;
    }
  }
};

export default mercadoPagoService;
