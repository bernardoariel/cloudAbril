<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- ── Grid principal (2/3) ──────────────────────────────────────── -->
      <div class="lg:col-span-2">
        <WsDataGrid
          ref="gridRef"
          title="Lista de Ventas"
          loading-message="Cargando ventas..."
          :is-loading="isLoading"
          :error="error"
          :base-data="filteredVentas"
          :columns="columns"
          row-key="venta_CodVenta"
          :selected-row-key="selectedVentaKey"
          :selected-keys="selectedKeys"
          :is-all-selected="isAllSelected"
          :mensajes-enviados="mensajesEnviados"
          :filter-valid-phones="filterValidPhones"
          :filter-invalid-phones="filterInvalidPhones"
          :sucursales="sucursales"
          sucursal-key="CodSucursal"
          :search-fields="['ApellidoCont', 'NombreCont', 'venta_CodVenta', 'NroDoc', 'Telefonos']"
          @phone-filters-update="onPhoneFiltersUpdate"
          @filter-date-update="handleFilterUpdate"
          @row-clicked="handleRowClick"
          @toggle-row-selection="toggleRowSelection"
          @set-select-all="setSelectAll"
          @whatsapp-detail-clicked="handleWhatsAppDetail"
          @open-whats-modal="openWhatsModal"
        />
      </div>

      <!-- ── Detalle de venta (1/3) ────────────────────────────────────── -->
      <div class="lg:col-span-1 space-y-4">
        <VentaDetailCard
          :venta="selectedVenta"
          :detalleFactura="detalle"
          :loadingDetalle="loadingDetalle"
          :errorDetalle="errorDetalle"
          :metodosPago="metodosPago"
        />
      </div>
    </div>
  </div>

  <!-- ── Modal Enviar WhatsApp ─────────────────────────────────────────── -->
  <dialog id="whatsModal" class="modal" :open="isWhatsModalOpen">
    <form method="dialog" class="modal-box">
      <h3 class="font-bold text-lg mb-2">Enviar WhatsApp — Ventas</h3>

      <div v-if="whatsAppMessage" class="alert mb-4"
        :class="whatsAppMessage.includes('Error') || whatsAppMessage.includes('❌') ? 'alert-error' : 'alert-success'">
        <span>{{ whatsAppMessage }}</span>
      </div>

      <div class="mb-4">
        <div class="font-semibold mb-1">Información del envío:</div>
        <div class="bg-base-200 p-3 rounded text-sm space-y-1">
          <p><strong>Registros seleccionados con tel. válido:</strong> {{ seleccionablesSeleccionados }}</p>
          <p class="text-xs text-base-content/60 mt-2">
            Template: <code>aviso_compra</code><br />
            Endpoint: {{ WHATSAPP_BASE_URL }}/whatsapp/aviso_compra_abril
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
  <dialog id="mensajeDetalleModal" class="modal" :open="modalMensajeOpen">
    <form method="dialog" class="modal-box max-w-2xl">
      <h3 class="font-bold text-lg mb-4">📱 Detalle del Mensaje WhatsApp</h3>

      <div v-if="mensajeDetalle" class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div>
            <p class="text-sm font-semibold text-base-content/60">Tipo:</p>
            <p class="badge badge-success">🛒 Compra</p>
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
import VentaDetailCard from '@/components/VentaDetailCard.vue';
import { useVentas } from '../composables/useVentas';
import type { Venta } from '../interfaces/Venta';
import { useDetalleFactura } from '@/composables/useDetalleFactura';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import { useWhatsAppHistory } from '@/composables/useWhatsAppHistory';
import { whatsappService } from '../services/whatsappService';
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
  filteredVentas,
} = useVentas();

const { detalle, loading: loadingDetalle, error: errorDetalle, fetchDetalle, metodosPago } = useDetalleFactura();
const { sucursales } = useSucursales();
const { mensajesEnviados, agregarMensaje, cargarHistorial } = useWhatsAppHistory();

// Ref al componente grilla para acceder a los datos filtrados
const gridRef = ref<InstanceType<typeof WsDataGrid> | null>(null);

onMounted(async () => {
  try {
    await cargarHistorial({ tipo: 'aviso_compra' });
  } catch (e) {
    console.error('Error al cargar historial:', e);
  }
});

// ── Selección de venta ────────────────────────────────────────────────────
const selectedVenta = ref<Venta | null>(null);
const selectedVentaKey = computed(() => selectedVenta.value?.venta_CodVenta ?? null);

const handleRowClick = (venta: Venta) => {
  selectedVenta.value = venta;
  if (venta?.venta_CodVenta) fetchDetalle(venta.venta_CodVenta);
};

// ── Filtros del grid ──────────────────────────────────────────────────────
const handleFilterUpdate = (filter: { from: string; to: string; label: string }) => {
  setDateRange(filter.from, filter.to);
  selectedVenta.value = null;
};

const onPhoneFiltersUpdate = (valid: boolean, invalid: boolean) => {
  setPhoneFilters(valid, invalid);
  selectedVenta.value = null;
};

// ── Contador de seleccionados enviables ───────────────────────────────────
const seleccionablesSeleccionados = computed(() => {
  const data = gridRef.value?.allFilteredData ?? [];
  return data.filter((item: any) => {
    const t = (item.Telefonos ?? '').replace(/\D/g, '');
    return t.length >= 10 && selectedKeys.value.has(item.venta_CodVenta);
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
type AvisoCompraPayload = {
  to: string;
  nombre: string;
  cod_venta: string;
  fecha_compra: string;
  documento: string;
  product_list: string;
  pago_list: string;
};

async function sendWhatsApp() {
  isSendingWhatsApp.value = true;
  whatsAppMessage.value = '';

  try {
    const allData = gridRef.value?.allFilteredData ?? [];
    const ventasSeleccionadas = allData.filter((item: any) => {
      const t = (item.Telefonos ?? '').replace(/\D/g, '');
      return t.length >= 10 && selectedKeys.value.has(item.venta_CodVenta);
    });

    if (!ventasSeleccionadas.length) {
      whatsAppMessage.value = 'No hay registros seleccionados con teléfonos válidos';
      return;
    }

    const ok: string[] = [];
    const fail: { nombre: string; motivo: string }[] = [];

    for (const v of ventasSeleccionadas) {
      const apellido = v.ApellidoCont || '';
      const nombre = v.NombreCont || '';
      let nombreCompleto = apellido && nombre ? `${apellido}, ${nombre}` : apellido || nombre || 'CLIENTE';

      try {
        const telefono = normalizePhone(v.Telefonos ?? '');
        if (!telefono) throw new Error('Teléfono inválido');

        await fetchDetalle(v.venta_CodVenta);

        const productosLista = detalle.value?.detalles?.length
          ? detalle.value.detalles.filter((d: any) => d.CodProducto >= 1000).map((d: any) => `${d.Cantidad} - ${d.NombreProducto}`).join(',')
          : '-';

        const metodosLista = metodosPago.value?.length
          ? metodosPago.value.map((m: any) => {
              if (String(m.CodForPago).includes('CREDITO') && m.CantCuotas > 1) {
                const cuota = m.Importe / m.CantCuotas;
                return `${m.CodForPago} ${m.CantCuotas} cuotas de $${Number(cuota).toLocaleString('es-AR')} ($${Number(m.Importe).toLocaleString('es-AR')})`;
              }
              return `${m.CodForPago} $${Number(m.Importe ?? 0).toLocaleString('es-AR')}`;
            }).join(',')
          : '-';

        const payload: AvisoCompraPayload = {
          to: telefono,
          nombre: nombreCompleto,
          cod_venta: String(v.venta_CodVenta),
          fecha_compra: new Date(v.venta_Fecha).toLocaleDateString('es-AR'),
          documento: String(v.NroDoc ?? ''),
          product_list: productosLista,
          pago_list: metodosLista,
        };

        const response = await whatsappService.sendAvisoCompra(payload);

        await agregarMensaje({
          tipo: 'aviso_compra',
          sourceSystem: 'VENTA',
          sourceId: String(v.venta_CodVenta),
          externalClientId: String(v.NroDoc ?? v.venta_CodVenta),
          telefono,
          nombre: nombreCompleto,
          payloadSnapshot: { productos: productosLista, metodosPago: metodosLista, total: detalle.value?.total || 0 },
          response,
        });

        ok.push(`${nombreCompleto} (${telefono})`);
        await sleep(350);
      } catch (e: any) {
        fail.push({ nombre: nombreCompleto, motivo: e?.message ?? 'Error desconocido' });
      }
    }

    whatsAppMessage.value =
      `Enviados ${ok.length}/${ventasSeleccionadas.length}.` +
      (ok.length ? ` ✅ OK: ${ok.join(' | ')}.` : '') +
      (fail.length ? ` ❌ Errores: ${fail.map(f => `${f.nombre} (${f.motivo})`).join(' | ')}.` : '');

    if (!fail.length) {
      await cargarHistorial({ tipo: 'aviso_compra' });
      setTimeout(() => { closeWhatsModal(); }, 1500);
    }
  } catch (err: any) {
    whatsAppMessage.value = `Error general: ${err?.message ?? 'desconocido'}`;
  } finally {
    isSendingWhatsApp.value = false;
  }
}
</script>
