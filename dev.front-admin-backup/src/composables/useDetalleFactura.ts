import { ref } from 'vue';
import axios from 'axios';
import { getMetodosPagoByVenta } from '../api/ventasApi';
import type { MetodoPagoVenta } from '../interfaces/Venta';

export function useDetalleFactura() {
  const detalle = ref<any>(null);
  const loading = ref(false);
  const error = ref<unknown>(null);
  const metodosPago = ref<MetodoPagoVenta[]>([]);

  const fetchDetalle = async (nroOperacion: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await axios.get(`http://localhost:3000/api/clientes-ventas/completa/${nroOperacion}`);
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