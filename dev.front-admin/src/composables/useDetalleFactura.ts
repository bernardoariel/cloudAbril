import { ref } from 'vue';
import axios from 'axios';
import { getMetodosPagoByVenta } from '../api/ventasApi';
import type { MetodoPagoVenta } from '../interfaces/Venta';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useDetalleFactura() {
  const detalle = ref<any>(null);
  const loading = ref(false);
  const error = ref<unknown>(null);
  const metodosPago = ref<MetodoPagoVenta[]>([]);

  const fetchDetalle = async (nroOperacion: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/clientes-ventas/completa/${nroOperacion}`,
      );
      detalle.value = data;
      metodosPago.value = await getMetodosPagoByVenta(nroOperacion);
    } catch (err) {
      error.value = err;
      detalle.value = null;
      metodosPago.value = [];
    } finally {
      loading.value = false;
    }
  };

  return { detalle, loading, error, fetchDetalle, metodosPago };
}
