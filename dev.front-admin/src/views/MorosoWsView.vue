<template>
  <div class="container mx-auto p-2">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

      <!-- ── Tabla principal (2/3) ──────────────────────────────────── -->
      <div class="lg:col-span-2 card bg-base-100 shadow-xl">
        <div class="card-body p-4">
          <WhatsAppTabs class="mb-4" />

          <div class="flex flex-wrap justify-between items-center mb-3 gap-2">
            <div class="flex items-center gap-2">
              <h2 class="card-title text-base">Lista de Morosos</h2>
              <!-- Badge dataset activo -->
              <span v-if="morososImportados.length" class="badge badge-success badge-sm gap-1">
                📄 {{ nombreArchivoImportado }} ({{ morososImportados.length }})
                <button class="ml-1 opacity-60 hover:opacity-100" @click.stop="limpiarImportacion">✕</button>
              </span>
              <span v-else class="badge badge-ghost badge-sm">MOCK</span>
            </div>
            <div class="flex items-center gap-2">
              <input
                v-model="busqueda"
                type="text"
                placeholder="Buscar..."
                class="input input-bordered input-sm w-36"
              />
              <!-- Importar Excel -->
              <button class="btn btn-outline btn-sm gap-1" @click="abrirSelectorArchivo">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importar Excel
              </button>
              <button
                class="btn btn-warning btn-sm gap-1"
                :disabled="seleccionados.length === 0"
                @click="isWhatsModalOpen = true"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.062.527 4.002 1.445 5.694L.057 23.5l5.974-1.568A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.803 9.803 0 0 1-5.03-1.384l-.361-.214-3.741.981.998-3.648-.234-.374A9.808 9.808 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                </svg>
                Enviar WhatsApp
                <span v-if="seleccionados.length" class="badge badge-sm bg-white text-warning font-bold">
                  {{ seleccionados.length }}
                </span>
              </button>
            </div>
          </div>

          <!-- Error de importación -->
          <div v-if="importError" class="alert alert-error text-xs py-2 mb-2">{{ importError }}</div>

          <div v-if="seleccionados.length > 0" class="text-xs text-warning font-semibold mb-2">
            {{ seleccionados.length }} seleccionado{{ seleccionados.length > 1 ? 's' : '' }}
          </div>

          <!-- Tabla -->
          <div class="overflow-x-auto">
            <table class="table table-sm w-full">
              <thead>
                <tr class="text-xs">
                  <th>
                    <input type="checkbox" class="checkbox checkbox-sm"
                      :checked="todosSeleccionados"
                      @change="toggleTodos"
                    />
                  </th>
                  <th>Nombre</th>
                  <th>Nro. Cuenta</th>
                  <th>Importe</th>
                  <th>Días mora</th>
                  <th v-if="selectedTemplate === 'moroso_1'" class="text-warning">Fecha máx. pago</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="m in morososPaginados"
                  :key="m.id"
                  class="hover cursor-pointer text-sm"
                  :class="selectedKeys.has(m.id) ? 'bg-warning/10' : ''"
                  @click="toggleSeleccion(m.id)"
                >
                  <td @click.stop>
                    <input type="checkbox" class="checkbox checkbox-sm checkbox-warning"
                      :checked="selectedKeys.has(m.id)"
                      @change="toggleSeleccion(m.id)"
                    />
                  </td>
                  <td class="font-semibold">{{ m.nombre }}</td>
                  <td class="font-mono text-xs">{{ m.nro_cuenta }}</td>
                  <td class="font-semibold text-error">{{ m.importe }}</td>
                  <td>
                    <span
                      class="badge badge-sm"
                      :class="m.dias_mora > DIAS_2 ? 'badge-error' : m.dias_mora > DIAS_1 ? 'badge-warning' : 'badge-info'"
                    >
                      {{ m.dias_mora }}d
                    </span>
                  </td>
                  <td v-if="selectedTemplate === 'moroso_1'" class="text-xs font-mono text-warning/80">
                    {{ new Date(m.fecha_max_pago + 'T00:00:00').toLocaleDateString('es-AR') }}
                  </td>
                  <td>
                    <!-- Teléfono con estética de pill -->
                    <span class="inline-flex items-center gap-1 bg-base-200 border border-base-300 rounded-full px-2 py-0.5 text-xs font-mono text-base-content/80 whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-success shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
                      </svg>
                      {{ formatPhone(m.telefono) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <PaginationControl
            :currentPage="paginaActual"
            :totalPages="totalPaginas"
            :recordsInfo="`${morososFiltrados.length} registros — página ${paginaActual} de ${totalPaginas}`"
            @page-changed="onPageChanged"
          />

          <div v-if="morososFiltrados.length === 0" class="text-center py-6 text-base-content/50 text-sm">
            No se encontraron registros.
          </div>
        </div>
      </div>

      <!-- ── Panel derecho (1/3) ──────────────────────────────────────── -->
      <div class="lg:col-span-1 space-y-4">

        <!-- Selector de plantilla -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-4">
            <h3 class="font-bold text-sm mb-1">Plantilla de Moroso</h3>
            <p class="text-xs text-base-content/60 mb-3">
              Seleccioná la categoría según el nivel de mora del cliente.
            </p>
            <div class="flex flex-col gap-2">
              <label
                v-for="opt in templateOptions"
                :key="opt.value"
                class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                :class="selectedTemplate === opt.value
                  ? 'border-warning bg-warning/10'
                  : 'border-base-300 hover:bg-base-200'"
              >
                <input
                  type="radio"
                  name="moroso_template"
                  :value="opt.value"
                  v-model="selectedTemplate"
                  class="radio radio-warning radio-sm mt-0.5"
                />
                <div>
                  <p class="font-semibold text-xs">{{ opt.label }}</p>
                  <p class="text-xs text-base-content/60">{{ opt.desc }}</p>
                </div>
              </label>
            </div>

            <div v-if="selectedTemplate === 'moroso_1'" class="mt-3">
              <label class="label py-1">
                <span class="label-text text-xs font-medium">Fecha máx. de pago</span>
              </label>
              <input
                type="date"
                v-model="fechaMaxPago"
                class="input input-bordered input-sm w-full"
              />
            </div>
          </div>
        </div>

        <!-- Preview plantilla -->
        <div class="card bg-base-100 shadow-xl">
          <div class="card-body p-4">
            <h3 class="font-bold text-xs text-base-content/60 mb-2 uppercase tracking-wide">Preview</h3>
            <div class="bg-base-200 rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap font-mono">{{ templatePreview }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ── Modal Enviar ─────────────────────────────────────────────────── -->
  <dialog class="modal" :open="isWhatsModalOpen">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-2">Enviar WhatsApp — Morosos</h3>

      <div v-if="whatsAppMessage" class="alert mb-4 text-sm"
        :class="whatsAppMessage.includes('❌') || whatsAppMessage.includes('Error') ? 'alert-error' : 'alert-success'">
        {{ whatsAppMessage }}
      </div>

      <div class="bg-base-200 rounded-lg p-3 text-sm space-y-1 mb-4">
        <p><strong>Plantilla:</strong>
          <span class="badge badge-warning badge-sm ml-1">{{ selectedTemplate }}</span>
        </p>
        <p><strong>Destinatarios:</strong> {{ seleccionados.length }}</p>
        <p v-if="selectedTemplate === 'moroso_1'">
          <strong>Fecha máx. pago:</strong>
          <span v-if="fechaMaxPago">{{ new Date(fechaMaxPago + 'T00:00:00').toLocaleDateString('es-AR') }} (override global)</span>
          <span v-else class="text-base-content/60">fecha individual por cliente</span>
        </p>
      </div>

      <ul class="text-xs space-y-1.5 max-h-40 overflow-y-auto mb-4">
        <li v-for="m in seleccionados" :key="m.id" class="flex items-center gap-2">
          <span class="text-base-content/40">•</span>
          <span class="font-semibold">{{ m.nombre }}</span>
          <span class="inline-flex items-center gap-1 bg-base-200 border border-base-300 rounded-full px-2 py-0.5 text-xs font-mono text-base-content/70 whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-success shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
            </svg>
            {{ formatPhone(m.telefono) }}
          </span>
        </li>
      </ul>

      <div class="modal-action">
        <button class="btn btn-outline btn-sm" @click="isWhatsModalOpen = false" :disabled="isSendingWhatsApp">
          Cancelar
        </button>
        <button class="btn btn-warning btn-sm" @click="sendWhatsApp" :disabled="isSendingWhatsApp">
          <span v-if="isSendingWhatsApp" class="loading loading-spinner loading-xs"></span>
          {{ isSendingWhatsApp ? 'Enviando...' : `Confirmar (${seleccionados.length})` }}
        </button>
      </div>
    </div>
    <div class="modal-backdrop" @click="isWhatsModalOpen = false"></div>
  </dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import * as XLSX from 'xlsx';
import WhatsAppTabs from '@/components/WhatsAppTabs.vue';
import PaginationControl from '@/components/PaginationControl.vue';
import { whatsappService } from '../services/whatsappService';
import { sleep } from '../common/helpers/sleep';

// ── Formato de teléfono ────────────────────────────────────────────────────
const formatPhone = (raw: string) => {
  const d = (raw ?? '').replace(/\D/g, '');
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  if (d.length === 12) return `+${d.slice(0, 2)} (${d.slice(2, 5)}) ${d.slice(5, 8)}-${d.slice(8)}`;
  return raw;
};

// ── Dataset mock (reemplazar con API real después) ─────────────────────────
interface Moroso {
  id: number;
  nombre: string;
  nro_cuenta: string;
  importe: string;
  dias_mora: number;
  telefono: string;
  fecha_max_pago: string; // ISO YYYY-MM-DD — fecha límite propuesta para regularizar
}

// ── Umbrales de mora desde .env ───────────────────────────────────────────
const DIAS_1 = parseInt(import.meta.env.VITE_MOROSO_DIAS_1 ?? '30');
const DIAS_2 = parseInt(import.meta.env.VITE_MOROSO_DIAS_2 ?? '60');
const DIAS_3 = parseInt(import.meta.env.VITE_MOROSO_DIAS_3 ?? '90');

const categoriaSugerida = (dias: number): 'moroso_1' | 'moroso_2' | 'moroso_3' => {
  if (dias <= DIAS_1) return 'moroso_1';
  if (dias <= DIAS_2) return 'moroso_2';
  if (dias <= DIAS_3) return 'moroso_3';
  return 'moroso_3';
};

// Helper: hoy + N días en ISO
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

// Número de prueba — todos los mock apuntan acá para testing
const TEL_PRUEBA = '3704299434';

const mockMorosos: Moroso[] = [
  // moroso_1 (≤30 días) — 12 registros
  { id:  1, nombre: 'GILL, NAZALIA ELIZABETH',   nro_cuenta: '22022771', importe: '$790.044',   dias_mora:  5, telefono: TEL_PRUEBA, fecha_max_pago: addDays(10) },
  { id:  2, nombre: 'VILLALBA, GRACIELA',        nro_cuenta: '08092110', importe: '$128.750',   dias_mora: 21, telefono: TEL_PRUEBA, fecha_max_pago: addDays(7)  },
  { id:  3, nombre: 'FERNANDEZ, CARLOS',         nro_cuenta: '09100234', importe: '$345.000',   dias_mora:  8, telefono: TEL_PRUEBA, fecha_max_pago: addDays(12) },
  { id:  4, nombre: 'GOMEZ, PATRICIA',           nro_cuenta: '11111167', importe: '$890.500',   dias_mora: 12, telefono: TEL_PRUEBA, fecha_max_pago: addDays(6)  },
  { id:  5, nombre: 'LOPEZ, JUAN MANUEL',        nro_cuenta: '12234890', importe: '$275.300',   dias_mora: 18, telefono: TEL_PRUEBA, fecha_max_pago: addDays(9)  },
  { id:  6, nombre: 'MARTINEZ, ROSA',            nro_cuenta: '13358613', importe: '$612.400',   dias_mora: 25, telefono: TEL_PRUEBA, fecha_max_pago: addDays(5)  },
  { id:  7, nombre: 'DIAZ, HERNAN',              nro_cuenta: '14482336', importe: '$430.800',   dias_mora:  3, telefono: TEL_PRUEBA, fecha_max_pago: addDays(14) },
  { id:  8, nombre: 'SILVA, ANALIA',             nro_cuenta: '15606059', importe: '$195.600',   dias_mora: 27, telefono: TEL_PRUEBA, fecha_max_pago: addDays(4)  },
  { id:  9, nombre: 'PEREZ, DIEGO',              nro_cuenta: '16729782', importe: '$740.100',   dias_mora: 10, telefono: TEL_PRUEBA, fecha_max_pago: addDays(11) },
  { id: 10, nombre: 'TORRES, NORMA',             nro_cuenta: '17853505', importe: '$320.000',   dias_mora: 22, telefono: TEL_PRUEBA, fecha_max_pago: addDays(8)  },
  { id: 11, nombre: 'RUIZ, MARCOS',              nro_cuenta: '18977228', importe: '$510.250',   dias_mora: 29, telefono: TEL_PRUEBA, fecha_max_pago: addDays(3)  },
  { id: 12, nombre: 'GUTIERREZ, IRMA',           nro_cuenta: '20100951', importe: '$88.700',    dias_mora: 15, telefono: TEL_PRUEBA, fecha_max_pago: addDays(10) },
  // moroso_2 (31–60 días) — 10 registros
  { id: 13, nombre: 'SANTANDER, LILIANA',        nro_cuenta: '04050256', importe: '$1.092.000', dias_mora: 45, telefono: TEL_PRUEBA, fecha_max_pago: addDays(7)  },
  { id: 14, nombre: 'JARA, MARIA HIPOLITA',      nro_cuenta: '05056028', importe: '$462.942',   dias_mora: 31, telefono: TEL_PRUEBA, fecha_max_pago: addDays(10) },
  { id: 15, nombre: 'ROJAS, PEDRO DANIEL',       nro_cuenta: '07081345', importe: '$548.200',   dias_mora: 52, telefono: TEL_PRUEBA, fecha_max_pago: addDays(5)  },
  { id: 16, nombre: 'RAMIREZ, LUIS',             nro_cuenta: '21224674', importe: '$450.000',   dias_mora: 38, telefono: TEL_PRUEBA, fecha_max_pago: addDays(6)  },
  { id: 17, nombre: 'MEDINA, ELENA',             nro_cuenta: '22348397', importe: '$330.800',   dias_mora: 58, telefono: TEL_PRUEBA, fecha_max_pago: addDays(4)  },
  { id: 18, nombre: 'CASTRO, ROBERTO',           nro_cuenta: '23472120', importe: '$178.900',   dias_mora: 41, telefono: TEL_PRUEBA, fecha_max_pago: addDays(7)  },
  { id: 19, nombre: 'VARGAS, CLAUDIA',           nro_cuenta: '24595843', importe: '$625.000',   dias_mora: 55, telefono: TEL_PRUEBA, fecha_max_pago: addDays(3)  },
  { id: 20, nombre: 'DOMINGUEZ, MARIO',          nro_cuenta: '25719566', importe: '$920.300',   dias_mora: 35, telefono: TEL_PRUEBA, fecha_max_pago: addDays(9)  },
  { id: 21, nombre: 'MORALES, SUSANA',           nro_cuenta: '26843289', importe: '$290.400',   dias_mora: 48, telefono: TEL_PRUEBA, fecha_max_pago: addDays(5)  },
  { id: 22, nombre: 'JIMENEZ, GABRIEL',          nro_cuenta: '27967012', importe: '$155.000',   dias_mora: 60, telefono: TEL_PRUEBA, fecha_max_pago: addDays(2)  },
  // moroso_3 (>60 días) — 9 registros
  { id: 23, nombre: 'AYALA, CLAUDIA',            nro_cuenta: '05056027', importe: '$210.400',   dias_mora: 62, telefono: TEL_PRUEBA, fecha_max_pago: addDays(5)  },
  { id: 24, nombre: 'MORA, OSBALDO ANTONIO',     nro_cuenta: '06067220', importe: '$466.800',   dias_mora: 88, telefono: TEL_PRUEBA, fecha_max_pago: addDays(3)  },
  { id: 25, nombre: 'ESTIGARRIBIA, MABEL',       nro_cuenta: '23041982', importe: '$303.000',   dias_mora: 73, telefono: TEL_PRUEBA, fecha_max_pago: addDays(3)  },
  { id: 26, nombre: 'ROMERO, BEATRIZ',           nro_cuenta: '29090735', importe: '$485.700',   dias_mora: 95, telefono: TEL_PRUEBA, fecha_max_pago: addDays(2)  },
  { id: 27, nombre: 'HERRERA, FABIO',            nro_cuenta: '30214458', importe: '$342.600',   dias_mora: 80, telefono: TEL_PRUEBA, fecha_max_pago: addDays(2)  },
  { id: 28, nombre: 'ALVAREZ, DIANA',            nro_cuenta: '31338181', importe: '$730.000',   dias_mora: 71, telefono: TEL_PRUEBA, fecha_max_pago: addDays(1)  },
  { id: 29, nombre: 'RAMOS, VICTOR',             nro_cuenta: '32461904', importe: '$265.000',   dias_mora: 105,telefono: TEL_PRUEBA, fecha_max_pago: addDays(1)  },
  { id: 30, nombre: 'GONZALEZ, MARCIA',          nro_cuenta: '33585627', importe: '$190.500',   dias_mora: 120,telefono: TEL_PRUEBA, fecha_max_pago: addDays(1)  },
  { id: 31, nombre: 'SOSA, DARIO',               nro_cuenta: '34709350', importe: '$820.000',   dias_mora: 68, telefono: TEL_PRUEBA, fecha_max_pago: addDays(2)  },
];

// ── Dataset importado desde Excel (vacío = usa mock) ──────────────────────
const morososImportados = ref<Moroso[]>([]);
const nombreArchivoImportado = ref('');
const importError = ref('');

const datasetActivo = computed(() =>
  morososImportados.value.length ? morososImportados.value : mockMorosos
);

// ── Importar Excel ─────────────────────────────────────────────────────────
// Se crea el input dinámicamente para evitar problemas de tipado con ref<HTMLInputElement>
const abrirSelectorArchivo = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx,.xls,.csv';
  input.onchange = (event: Event) => procesarArchivo(event);
  input.click();
};

const procesarArchivo = (event: Event) => {
  importError.value = '';
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  nombreArchivoImportado.value = file.name;
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      const parsed: Moroso[] = rows.map((row, i) => {
        // Columnas flexibles: acepta mayúsculas y minúsculas
        const get = (...keys: string[]) => {
          for (const k of keys) {
            const found = Object.keys(row).find(r => r.toLowerCase() === k.toLowerCase());
            if (found && row[found] !== '') return String(row[found]).trim();
          }
          return '';
        };

        const diasRaw = parseInt(get('dias_mora', 'dias mora', 'diasmora', 'dias')) || 0;

        // fecha_max_pago: si viene del excel la usa, si no calcula hoy+5
        let fmp = get('fecha_max_pago', 'fecha max pago', 'vencimiento');
        if (!fmp) {
          fmp = addDays(5);
        } else {
          // Intentar normalizar a ISO si viene como dd/mm/yyyy
          const parts = fmp.split('/');
          if (parts.length === 3) fmp = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`;
        }

        return {
          id: i + 1,
          nombre:       get('nombre', 'cliente', 'apellido_nombre'),
          nro_cuenta:   get('nro_cuenta', 'nro cuenta', 'cuenta', 'nrocuenta'),
          importe:      get('importe', 'saldo', 'monto', 'deuda'),
          dias_mora:    diasRaw,
          telefono:     get('telefono', 'tel', 'celular', 'telefono1'),
          fecha_max_pago: fmp,
        };
      }).filter(m => m.nombre && m.telefono);

      if (!parsed.length) {
        importError.value = 'No se encontraron registros válidos. Verificá las columnas del Excel.';
        return;
      }

      morososImportados.value = parsed;
      selectedKeys.value = new Set();
    } catch (err: any) {
      importError.value = `Error al leer el archivo: ${err?.message ?? 'desconocido'}`;
    }
  };

  reader.readAsArrayBuffer(file);
  // Reset input para permitir re-importar el mismo archivo
  input.value = '';
};

const limpiarImportacion = () => {
  morososImportados.value = [];
  nombreArchivoImportado.value = '';
  importError.value = '';
  selectedKeys.value = new Set();
};

// ── Estado ─────────────────────────────────────────────────────────────────
type TemplateKey = 'moroso_1' | 'moroso_2' | 'moroso_3';

const busqueda = ref('');
const selectedKeys = ref<Set<number>>(new Set());
const selectedTemplate = ref<TemplateKey>('moroso_1');
const paginaActual = ref(1);
const porPagina = ref(10);
watch(selectedTemplate, () => { selectedKeys.value = new Set(); paginaActual.value = 1; });
watch(busqueda, () => { paginaActual.value = 1; });
watch(porPagina, () => { paginaActual.value = 1; });

const _d = new Date();
_d.setDate(_d.getDate() + 5);
const fechaMaxPago = ref(_d.toISOString().split('T')[0]);

const isWhatsModalOpen = ref(false);
const isSendingWhatsApp = ref(false);
const whatsAppMessage = ref('');

const templateOptions = [
  { value: 'moroso_1', label: 'Moroso 1 — Primer aviso',      desc: 'Recordatorio amable con fecha límite de pago.' },
  { value: 'moroso_2', label: 'Moroso 2 — Reiterado',         desc: 'Atraso reiterado, posible reporte a Veraz.' },
  { value: 'moroso_3', label: 'Moroso 3 — Re-moroso / Legal', desc: 'Situación crítica: 48 hs o acciones legales.' },
];

// ── Computed ───────────────────────────────────────────────────────────────
const morososFiltrados = computed(() => {
  const porCategoria = datasetActivo.value.filter(m =>
    categoriaSugerida(m.dias_mora) === selectedTemplate.value
  );
  if (!busqueda.value.trim()) return porCategoria;
  const q = busqueda.value.toLowerCase();
  return porCategoria.filter(m =>
    m.nombre.toLowerCase().includes(q) ||
    m.nro_cuenta.includes(q) ||
    m.telefono.includes(q)
  );
});

const totalPaginas = computed(() => Math.max(1, Math.ceil(morososFiltrados.value.length / porPagina.value)));

const morososPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value;
  return morososFiltrados.value.slice(inicio, inicio + porPagina.value);
});

const seleccionados = computed(() =>
  datasetActivo.value.filter(m => selectedKeys.value.has(m.id))
);

const todosSeleccionados = computed(() =>
  morososFiltrados.value.length > 0 &&
  morososFiltrados.value.every(m => selectedKeys.value.has(m.id))
);

const templatePreview = computed(() => {
  const ej = seleccionados.value[0] ?? datasetActivo.value[0] ?? mockMorosos[0];
  const hoy = new Date().toLocaleDateString('es-AR');
  const fmp = fechaMaxPago.value
    ? new Date(fechaMaxPago.value + 'T00:00:00').toLocaleDateString('es-AR')
    : hoy;

  if (selectedTemplate.value === 'moroso_1') {
    return `Estimado/a ${ej.nombre}:\nLe recordamos que su cuenta nro. ${ej.nro_cuenta} presenta un atraso en el pago correspondiente del mes de ${ej.importe}. Para evitar intereses, regularice antes del ${fmp}.\n...\nABRIL AMOBLAMIENTOS SRL`;
  }
  if (selectedTemplate.value === 'moroso_2') {
    return `Estimado/a ${ej.nombre}:\nSu cuenta Nº${ej.nro_cuenta} está en condición de moroso. Le solicitamos regularizar de inmediato el pago de Pesos ${ej.importe}.\n...\nABRIL AMOBLAMIENTOS SRL`;
  }
  return `ABRIL AMOBLAMIENTOS SRL\n${hoy}\nEstimado/a ${ej.nombre}:\nSu cuenta Nº ${ej.nro_cuenta} está en condición de RE-MOROSO.\nSaldo pendiente: Pesos ${ej.importe}. Regularice en 48 hs o se iniciarán acciones legales.\n...\nÁrea LEGAL\nABRIL AMOBLAMIENTOS SRL`;
});

// ── Paginación ─────────────────────────────────────────────────────────────
const onPageChanged = (page: number) => { paginaActual.value = page; };

// ── Selección ──────────────────────────────────────────────────────────────
const toggleSeleccion = (id: number) => {
  const s = new Set(selectedKeys.value);
  s.has(id) ? s.delete(id) : s.add(id);
  selectedKeys.value = s;
};

const toggleTodos = () => {
  if (todosSeleccionados.value) {
    selectedKeys.value = new Set();
  } else {
    selectedKeys.value = new Set(morososFiltrados.value.map(m => m.id));
  }
};

// ── Envío ──────────────────────────────────────────────────────────────────
const normalizeForSend = (raw: string) => {
  let t = raw.replace(/\D/g, '');
  if (t.length === 10) t = '54' + t;
  // const telefonoPrueba = '343704299434'; // <- descomentar para prueba
  // t = telefonoPrueba;
  return t;
};

async function sendWhatsApp() {
  isSendingWhatsApp.value = true;
  whatsAppMessage.value = '';

  const ok: string[] = [];
  const fail: { nombre: string; motivo: string }[] = [];
  const hoy = new Date().toLocaleDateString('es-AR');

  try {
    for (const m of seleccionados.value) {
      try {
        const to = normalizeForSend(m.telefono);

        if (selectedTemplate.value === 'moroso_1') {
          // Si el picker global tiene valor lo usa como override; si no, usa la fecha por cliente
          const fechaParaEnvio = fechaMaxPago.value
            ? new Date(fechaMaxPago.value + 'T00:00:00').toLocaleDateString('es-AR')
            : new Date(m.fecha_max_pago + 'T00:00:00').toLocaleDateString('es-AR');
          await whatsappService.sendMoroso1({ to, cliente: m.nombre, nro_cuenta: m.nro_cuenta, importe: m.importe, fecha_max_pago: fechaParaEnvio });
        } else if (selectedTemplate.value === 'moroso_2') {
          await whatsappService.sendMoroso2({ to, nombre: m.nombre, nro_cuenta: m.nro_cuenta, importe: m.importe });
        } else {
          await whatsappService.sendMoroso3({ to, fecha: hoy, nombre: m.nombre, nro_cuenta: m.nro_cuenta, importe: m.importe });
        }

        ok.push(m.nombre);
        await sleep(350);
      } catch (e: any) {
        fail.push({ nombre: m.nombre, motivo: e?.message ?? 'Error' });
      }
    }

    whatsAppMessage.value =
      `Enviados ${ok.length}/${seleccionados.value.length}.` +
      (ok.length ? ` ✅ ${ok.join(', ')}.` : '') +
      (fail.length ? ` ❌ ${fail.map(f => `${f.nombre} (${f.motivo})`).join(', ')}.` : '');

    if (!fail.length) {
      selectedKeys.value = new Set();
      setTimeout(() => { isWhatsModalOpen.value = false; whatsAppMessage.value = ''; }, 1800);
    }
  } catch (err: any) {
    whatsAppMessage.value = `Error general: ${err?.message ?? 'desconocido'}`;
  } finally {
    isSendingWhatsApp.value = false;
  }
}
</script>
