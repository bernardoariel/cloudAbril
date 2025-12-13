<script setup lang="ts">
import { toRef } from 'vue';
import WhatsappPreview from '@/components/WhatsappPreview.vue';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import { useWhatsappPreviewMessage } from '@/composables/useWhatsappPreviewMessage';

const props = defineProps<{
  recibo: any | null;
}>();

const { findSucursalById } = useSucursales();

const { title, subtitle, message, isEmpty } = useWhatsappPreviewMessage({
  item: toRef(props, 'recibo'),
  type: 'recibo',
  findSucursalById,
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
        placeholder-message="Seleccione un item para visualizar el recibo"
      />
    </div>
  </div>
</template>
