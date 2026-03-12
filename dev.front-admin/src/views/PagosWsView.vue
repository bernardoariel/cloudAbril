<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- ── Grid principal (2/3) ──────────────────────────────────────── -->
      <div class="lg:col-span-2">
        <WsDataGrid
          ref="gridRef"
          title="Listado de Pagos"
          loading-message="Cargando recibos..."
          :is-loading="isLoading"
          :error="error"
          :base-data="filteredRecibos"
          :columns="columns"
          row-key="CodReciboPr"
          :selected-row-key="selectedReciboKey"
          :selected-keys="selectedKeys"
          :is-all-selected="isAllSelected"
          :mensajes-enviados="mensajesEnviados"
          :filter-valid-phones="filterValidPhones"
          :filter-invalid-phones="filterInvalidPhones"
          :sucursales="sucursales"
          sucursal-key="CodSucursal"
          :search-fields="['ApellidoCont', 'NombreCont', 'CodReciboPr', 'CodCredito', 'Telefonos', 'NroDoc']"
          @phone-filters-update="onPhoneFiltersUpdate"
          @filter-date-update="handleFilterUpdate"
          @row-clicked="handleRowClick"
          @toggle-row-selection="toggleRowSelection"
          @set-select-all="setSelectAll"
          @whatsapp-detail-clicked="handleWhatsAppDetail"
          @open-whats-modal="openWhatsModal"
        />
      </div>

      <!-- ── Detalle de recibo (1/3) ────────────────────────────────────── -->
      <div class="lg:col-span-1 space-y-4">
        <ReciboDetailCard :recibo="selectedRecibo" />
      </div>
    </div>
  </div>

  <!-- ── Modal Enviar WhatsApp ─────────────────────────────────────────── -->
  <dialog id="whatsModalPagos" class="modal" :open="isWhatsModalOpen">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-2">Enviar WhatsApp — Pagos</h3>

      <div v-if="whatsAppMessage" class="alert mb-4"
        :class="whatsAppMessage.includes('Error') || whatsAppMessage.includes('❌') ? 'alert-error' : 'alert-success'">
        <span>{{ whatsAppMessage }}</span>
      </div>

      <div class="mb-4">
        <div class="font-semibold mb-1">Información del envío:</div>
        <div class="bg-base-200 p-3 rounded text-sm space-y-1">
          <p><strong>Registros seleccionados con tel. válido:</strong> {{ seleccionablesSeleccionados }}</p>
          <p class="text-xs text-base-content/60 mt-2">
            Template: <code>aviso_pago_abril</code><br />
            Endpoint: {{ WHATSAPP_BASE_URL }}/whatsapp/aviso_pago_abril
          </p>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-outline" @click="closeWhatsModal" type="button" :disabled="isSendingWhatsApp">
          Cancelar
        </button>
        <button class="btn btn-success" type="button" @click="sendWhatsApp"
          :disabled="isSendingWhatsApp || seleccionablesSeleccionados === 0">
          <span v-if="isSendingWhatsApp" class="loading loading-spinner loading-sm"></span>
          {{ isSendingWhatsApp ? 'Enviando...' : `Enviar (${seleccionablesSeleccionados})` }}
        </button>
      </div>
    </form>
  </dialog>

  <!-- ── Modal detalle mensaje enviado ────────────────────────────────── -->
  <dialog id="mensajeDetalleModalPagos" class="modal" :open="modalMensajeOpen">
    <form method="dialog" class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">📱 Detalle del Mensaje WhatsApp</h3>

      <div v-if="mensajeDetalle" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-sm font-semibold text-base-content/60">Tipo:</p>
            <p class="badge badge-warning">💰 Pago</p>
          </div>
          <div>
            <p class="text-sm font-semibold text-base-content/60">Fecha de envío:</p>
            <p>{{ new Date(mensajeDetalle.fecha_envio).toLocaleString('es-AR') }}</p>
          </div>
        </div>
        <div class="divider"></div>
        <div>
          <p class="text-sm font-semibold text-base-content/60">Cliente:</p>
          <p class="text-lg">{{ mensajeDetalle.nombre }}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-base-content/60">Teléfono:</p>
          <p>
            <a :href="`https://wa.me/${mensajeDetalle.telefono}`" target="_blank" rel="noopener noreferrer" class="link link-primary">
              {{ mensajeDetalle.telefono }}
            </a>
          </p>
        </div>
        <div>
          <p class="text-sm font-semibold text-base-content/60">Referencia:</p>
          <p>{{ mensajeDetalle.source_system }}: {{ mensajeDetalle.source_id }}</p>
        </div>
        <div v-if="mensajeDetalle.response" class="mt-4">
          <p class="text-sm font-semibold text-base-content/60 mb-2">Respuesta del servidor:</p>
          <div class="bg-base-200 p-3 rounded text-xs overflow-auto max-h-60">
            <pre>{{ JSON.stringify(mensajeDetalle.response, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn" @click="cerrarModalMensaje">Cerrar</button>
      </div>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import WsDataGrid from '@/components/WsDataGrid.vue';
import ReciboDetailCard from '@/components/ReciboDetailCard.vue';
import { usePagos } from '../composables/usePagos';
import type { Recibo } from '../interfaces/Recibo';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import { useWhatsAppHistory } from '@/composables/useWhatsAppHistory';
import { whatsappService } from '../services/whatsappService';
import type { AvisoPagoPayload } from '../services/whatsappService';
import { normalizePhone } from '../common/helpers/normalizePhone';
import { sleep } from '../common/helpers/sleep';

const WHATSAPP_BASE_URL = import.meta.env.VITE_WHATSAPP_BASE_URL;

const {
  isLoading,
  error,
  columns,
  filterValidPhones,
  filterInvalidPhones,
  selectedKeys,
  isAllSelected,
  setDateRange,
  setPhoneFilters,
  toggleRowSelection,
  setSelectAll,
  filteredRecibos,
} = usePagos();

const { sucursales, findSucursalById } = useSucursales();
const { mensajesEnviados, agregarMensaje, cargarHistorial } = useWhatsAppHistory();

// Ref al componente grilla para acceder a los datos filtrados
const gridRef = ref<InstanceType<typeof WsDataGrid> | null>(null);

onMounted(async () => {
  try {
    await cargarHistorial({ tipo: 'aviso_pago' });
  } catch (e) {
    console.error('Error al cargar historial:', e);
  }
});

// ── Selección de recibo ───────────────────────────────────────────────────
const selectedRecibo = ref<Recibo | null>(null);
const selectedReciboKey = computed(() => selectedRecibo.value?.CodReciboPr ?? null);

const handleRowClick = (recibo: Recibo) => {
  selectedRecibo.value = recibo;
};

// ── Filtros del grid ──────────────────────────────────────────────────────
const handleFilterUpdate = (filter: { from: string; to: string; label: string }) => {
  setDateRange(filter.from, filter.to);
  selectedRecibo.value = null;
};

const onPhoneFiltersUpdate = (valid: boolean, invalid: boolean) => {
  setPhoneFilters(valid, invalid);
  selectedRecibo.value = null;
};

// ── Contador de seleccionados enviables ───────────────────────────────────
const seleccionablesSeleccionados = computed(() => {
  const data = gridRef.value?.allFilteredData ?? [];
  return data.filter((item: any) => {
    const tel = item.Telefonos || item.telefonos;
    const t = (tel ?? '').replace(/\D/g, '');
    return t.length >= 10 && selectedKeys.value.has(item.CodReciboPr ?? item.codReciboPr);
  }).length;
});

// ── Modal WhatsApp ─────────────────────────────────────────────────────────
const isWhatsModalOpen = ref(false);
const isSendingWhatsApp = ref(false);
const whatsAppMessage = ref('');

const openWhatsModal = () => { isWhatsModalOpen.value = true; };
const closeWhatsModal = () => { isWhatsModalOpen.value = false; whatsAppMessage.value = ''; };

// ── Modal detalle mensaje ─────────────────────────────────────────────────
const modalMensajeOpen = ref(false);
const mensajeDetalle = ref<any>(null);

const handleWhatsAppDetail = (mensaje: any) => { mensajeDetalle.value = mensaje; modalMensajeOpen.value = true; };
const cerrarModalMensaje = () => { modalMensajeOpen.value = false; mensajeDetalle.value = null; };

// ── Envío WhatsApp ─────────────────────────────────────────────────────────
async function sendWhatsApp() {
  isSendingWhatsApp.value = true;
  whatsAppMessage.value = '';

  try {
    const allData = gridRef.value?.allFilteredData ?? [];
    const recibosSeleccionados = allData.filter((item: any) => {
      const tel = item.Telefonos || item.telefonos;
      const t = (tel ?? '').replace(/\D/g, '');
      return t.length >= 10 && selectedKeys.value.has(item.CodReciboPr ?? item.codReciboPr);
    });

    if (!recibosSeleccionados.length) {
      whatsAppMessage.value = 'No hay registros seleccionados con teléfonos válidos';
      return;
    }

    const ok: string[] = [];
    const fail: { nombre: string; motivo: string }[] = [];

    for (const r of recibosSeleccionados) {
      const apellido = r.ApellidoCont || '';
      const nombre = r.NombreCont || r.nombreCont || '';
      let nombreCompleto = apellido && nombre ? `${apellido}, ${nombre}` : apellido || nombre || 'CLIENTE';

      try {
        const telefono = normalizePhone(r.Telefonos || r.telefonos || '');
        if (!telefono) throw new Error('Teléfono inválido');

        const nroRecibo = String(r.CodReciboPr || r.codReciboPr || '');
        const codigoSucursal = r.CodSucursal || r.codSucRecibo || r.CodSucRecibo;
        const sucursal = findSucursalById(codigoSucursal);
        const nombreSucursal = sucursal?.NombreSuc ?? 'SUCURSAL NO ENCONTRADA';

        const payload: AvisoPagoPayload = {
          to: telefono,
          nombre: nombreCompleto,
          nro_operacion: String(r.codCredito || r.CodCredito || ''),
          nro_recibo: nroRecibo,
          fecha: new Date(r.Fecha).toLocaleDateString('es-AR'),
          documento: String(r.NroDoc || r.nroDoc || ''),
          nombre_sucursal: nombreSucursal,
          importe: `$${Number(r.MontoPagado || r.montoPagado || 0).toLocaleString('es-AR')}`,
        };

        const response = await whatsappService.sendAvisoPago(payload);

        await agregarMensaje({
          tipo: 'aviso_pago',
          sourceSystem: 'PAGO',
          sourceId: nroRecibo,
          externalClientId: String(r.NroDoc || r.nroDoc || r.CodReciboPr || r.codReciboPr),
          telefono,
          nombre: nombreCompleto,
          payloadSnapshot: {
            nro_operacion: String(r.codCredito || r.CodCredito || ''),
            sucursal: nombreSucursal,
            importe: Number(r.MontoPagado || r.montoPagado || 0),
          },
          response,
        });

        ok.push(`${nombreCompleto} (${telefono})`);
        await sleep(350);
      } catch (e: any) {
        fail.push({ nombre: nombreCompleto, motivo: e?.message ?? 'Error desconocido' });
      }
    }

    whatsAppMessage.value =
      `Enviados ${ok.length}/${recibosSeleccionados.length}.` +
      (ok.length ? ` ✅ OK: ${ok.join(' | ')}.` : '') +
      (fail.length ? ` ❌ Errores: ${fail.map(f => `${f.nombre} (${f.motivo})`).join(' | ')}.` : '');

    if (!fail.length) {
      setTimeout(() => { closeWhatsModal(); }, 1500);
    }
  } catch (err: any) {
    whatsAppMessage.value = `Error general: ${err?.message ?? 'desconocido'}`;
  } finally {
    isSendingWhatsApp.value = false;
  }
}
</script>
