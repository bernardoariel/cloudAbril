<template>
    <div class="relative">
      <vue-tailwind-datepicker
        v-model="dateValue"
        :formatter="formatter"
        :options="options"
        :shortcuts="shortcuts"
        input-classes="btn btn-ghost"
        @update:model-value="handleDateChange"
        as-single
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
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