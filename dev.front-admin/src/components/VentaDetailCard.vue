<script setup lang="ts">
import { computed, toRef } from 'vue';
import type { Venta, MetodoPagoVenta } from '../interfaces/Venta';
import WhatsappPreview from '@/components/WhatsappPreview.vue';
import { useFormaPago } from '@/modules/sqlserver/forma-pago/composable/useFormaPago';
import { useWhatsappPreviewMessage } from '@/composables/useWhatsappPreviewMessage';

const props = defineProps<{
  venta: Venta | null;
  detalleFactura?: any;
  loadingDetalle?: boolean;
  errorDetalle?: any;
  metodosPago?: MetodoPagoVenta[];
}>();

const { formaPago } = useFormaPago();

const metodosPagoLabels = computed<Record<string, string>>(() => {
  const dic: Record<string, string> = {};
  formaPago.value?.forEach((fp) => (dic[fp.CodForPago] = fp.FormaPago));
  return dic;
});

const { title, subtitle, message, isEmpty } = useWhatsappPreviewMessage({
  item: toRef(props, 'venta'),
  type: 'venta',
  ventaDetalleFactura: toRef(props, 'detalleFactura'),
  ventaLoadingDetalle: toRef(props, 'loadingDetalle'),
  ventaMetodosPago: toRef(props, 'metodosPago'),
  metodosPagoLabels,
});
</script>

<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <WhatsappPreview
        :title="title"
        :subtitle="subtitle"
        :message="message"
        :is-empty="isEmpty"
        placeholder-message="Seleccione un item para visualizar la venta"
      />
    </div>
  </div>
</template>
