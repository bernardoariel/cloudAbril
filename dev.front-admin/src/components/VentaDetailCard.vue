<script setup lang="ts">
import { computed } from 'vue';
import type { Venta, MetodoPagoVenta } from '../interfaces/Venta';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import { useFormaPago } from '@/modules/sqlserver/forma-pago/composable/useFormaPago';

const props = defineProps<{
  venta: Venta | null;
  detalleFactura?: any;
  loadingDetalle?: boolean;
  errorDetalle?: any;
  metodosPago?: MetodoPagoVenta[];
}>();

const { findSucursalById } = useSucursales();
const { formaPago } = useFormaPago();

const METODOS_PAGO_LABELS = computed<Record<string, string>>(() => {
  const dic: Record<string, string> = {};
  formaPago.value?.forEach(fp => {
    dic[fp.CodForPago] = fp.FormaPago;
  });
  return dic;
});

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `(${day}/${month}/${year})`;
};

const cuerpo = "Nos complace comunicarnos desde ABRIL Amoblamientos SRL\nsu cuenta registra una Nueva Operación:";

const detalle = computed(() => {
  if (!props.venta) return '';

  let productos = '';
  if (props.loadingDetalle) {
    productos = '\n\nProductos ->\n[SPINNER_PRODUCTOS]';
  } else if (props.detalleFactura && Array.isArray(props.detalleFactura.detalles)) {
    const detallesFiltrados = props.detalleFactura.detalles.filter((d: any) => d.CodProducto >= 1000);
    if (detallesFiltrados.length > 0) {
      productos = '\n\nProductos ->';
      detallesFiltrados.forEach((d: any) => {
        productos += `\n${d.Cantidad} - ${d.NombreProducto}`;
      });
    }
  }

  let metodos = '';
  if (props.loadingDetalle) {
    metodos = '\n\nMetodos ->\n[SPINNER_METODOS]';
  } else if (props.metodosPago && props.metodosPago.length > 0) {
    metodos = '\n\nMetodos ->';
    props.metodosPago.forEach((m) => {
      const label = METODOS_PAGO_LABELS.value[m.CodForPago] || m.CodForPago;
      metodos += `\n${label} $${m.Importe.toLocaleString('es-AR')}`;
    });
  }

  return `Operacion N*: ${props.venta.venta_CodVenta} Fecha: ${formatDate(
    props.venta.venta_Fecha,
  )}\nNombre: ${props.venta.Nombre}\nDocumento: (${props.venta.NroDoc})${productos}${metodos}`;
});

const pie = "Gracias por elegirnos ... que disfrute su Compra!";
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <h2 class="card-title">Detalle de Venta</h2>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Cuerpo</span>
        </label>
        <textarea class="textarea textarea-bordered h-16 text-xs " readonly>{{ cuerpo }}</textarea>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Detalle</span>
        </label>
        <div v-if="loadingDetalle" class="flex justify-center items-center min-h-[12rem]">
          <span class="loading loading-dots loading-lg"></span>
        </div>
        <textarea v-else class="textarea textarea-bordered h-72 text-sm" readonly>{{ detalle }}</textarea>
      </div>
      <div class="form-control">
        <label class="label">
          <span class="label-text">Pie</span>
        </label>
        <textarea class="textarea textarea-bordered h-16 text-xs" readonly>{{ pie }}</textarea>
      </div>
      <div class="form-control mt-2">
        <label class="label">
          <!-- <span class="label-text">Detalle de Factura</span> -->
        </label>
        
        <div v-if="errorDetalle" class="text-error py-2">
          Error al cargar el detalle de la factura
        </div>
        <div v-else-if="detalleFactura">
          <!-- <pre class="bg-base-200 rounded p-2 text-xs overflow-x-auto">{{ detalleFactura }}</pre> -->
        </div>
        <div v-else class="text-gray-400 text-xs">Seleccione una venta para ver el detalle completo.</div>
      </div>
    </div>
  </div>
</template> 