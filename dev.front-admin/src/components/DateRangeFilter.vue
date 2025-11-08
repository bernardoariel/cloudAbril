<template>
  <div class="relative">
    <vue-tailwind-datepicker
      i18n="es"
      v-model="dateValue"
      :formatter="formatter"
      :options="options"
      :shortcuts="shortcuts"
      @update:model-value="handleDateChange"
    >
      <template #trigger>
        <button class="btn btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span v-if="dateValue.startDate">{{ dateValue.startDate }} - {{ dateValue.endDate }}</span>
          <span v-else>Seleccionar Rango</span>
        </button>
      </template>
    </vue-tailwind-datepicker>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VueTailwindDatepicker from 'vue-tailwind-datepicker'

const emit = defineEmits(['filter-applied'])

const dateValue = ref({
  startDate: '',
  endDate: '',
})

const formatter = ref({
  date: 'DD/MM/YYYY',
  month: 'MMM',
})

const options = ref({
  shortcutsPosition: 'right',
  shortcuts: {
    today: 'Hoy',
    yesterday: 'Ayer',
    past: (period: number) => `Últimos ${period} días`,
    currentMonth: 'Este mes',
    pastMonth: 'Mes pasado',
  },
  footer: {
    apply: 'Aplicar',
    cancel: 'Cancelar',
  },
})

onMounted(() => {
    const today = new Date()
    const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`
    
    dateValue.value = {
        startDate: todayFormatted,
        endDate: todayFormatted
    };
    handleDateChange()
})

const shortcuts = ref(() => [
  {
    label: 'Hoy',
    atClick: () => {
      const date = new Date()
      return [date, date]
    },
  },
  {
    label: 'Ayer',
    atClick: () => {
      const date = new Date()
      date.setDate(date.getDate() - 1)
      return [date, date]
    },
  },
  {
    label: 'Últimos 7 días',
    atClick: () => {
      const date = new Date()
      return [new Date(date.getTime() - 6 * 24 * 60 * 60 * 1000), date]
    },
  },
  {
    label: 'Últimos 30 días',
    atClick: () => {
      const date = new Date()
      return [new Date(date.getTime() - 29 * 24 * 60 * 60 * 1000), date]
    },
  },
  {
    label: 'Este mes',
    atClick: () => {
      const date = new Date()
      return [
        new Date(date.getFullYear(), date.getMonth(), 1),
        new Date(date.getFullYear(), date.getMonth() + 1, 0),
      ]
    },
  },
  {
    label: 'Mes pasado',
    atClick: () => {
      const date = new Date()
      const lastMonth = new Date(date.getFullYear(), date.getMonth() - 1, 1)
      return [lastMonth, new Date(date.getFullYear(), date.getMonth(), 0)]
    },
  },
])

const handleDateChange = () => {
  if (dateValue.value.startDate && dateValue.value.endDate) {
    emit('filter-applied', {
      from: dateValue.value.startDate,
      to: dateValue.value.endDate,
      label: `${dateValue.value.startDate} - ${dateValue.value.endDate}`,
    })
  }
}
</script> 