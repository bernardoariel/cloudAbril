import type { Venta, MetodoPagoVenta } from '../interfaces/Venta';

const API_URL = 'http://localhost:3000/api';

const formatDateForApi = (dateString: string) => {
  if (!dateString.includes('/')) return dateString; // Si ya está en otro formato, no lo toques.
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

export const getVentasByDateRange = async (desde: string, hasta: string): Promise<Venta[]> => {
  if (!desde || !hasta) {
    return []; // No hacer la petición si las fechas no están definidas
  }
  
  const formattedDesde = formatDateForApi(desde);
  const formattedHasta = formatDateForApi(hasta);

  const response = await fetch(`${API_URL}/clientes-ventas/filtro/fecha?desde=${formattedDesde}&hasta=${formattedHasta}`);
  
  if (!response.ok) {
    throw new Error('Error al obtener las ventas desde la API');
  }
  
  const data = await response.json();
  return data;
};

export const getMetodosPagoByVenta = async (codVenta: string): Promise<MetodoPagoVenta[]> => {
  if (!codVenta) return [];
  const response = await fetch(`${API_URL}/clientes-metpagos/venta/${codVenta}`);
  console.log(response)
  if (!response.ok) {
    throw new Error('Error al obtener los métodos de pago de la venta');
  }
  return await response.json();
}; 