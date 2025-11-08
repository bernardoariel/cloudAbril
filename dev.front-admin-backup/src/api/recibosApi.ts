import type { Recibo } from '../interfaces/Recibo';

const API_BASE_URL = 'http://localhost:3000/api';

const formatDateForApi = (dateString: string) => {
  if (!dateString.includes('/')) return dateString; // Si ya está en otro formato, no lo toques.
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

export const getRecibosByDateRange = async (dateFrom: string, dateTo: string): Promise<Recibo[]> => {
  if (!dateFrom || !dateTo) {
    return [];
  }

  const formattedDesde = formatDateForApi(dateFrom);
  const formattedHasta = formatDateForApi(dateTo);

  try {
    const response = await fetch(
      `${API_BASE_URL}/clientes-recprov/filtro/fecha?desde=${formattedDesde}&hasta=${formattedHasta}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener recibos: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error al obtener recibos:', error);
    throw error;
  }
}; 