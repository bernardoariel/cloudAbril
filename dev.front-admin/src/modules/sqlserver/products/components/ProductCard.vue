<template>
  <div class="card bg-orange-300 shadow-xl p-4 lg:flex lg:flex-row lg:items-center mb-16">
    <figure class="lg:w-1/2 flex justify-center">
      <img
        v-if="producto.Imagen"
        :src="producto.Imagen ? producto.Imagen.replace(/:8080/, '') : imgDefault"
        alt="Product Image"
        class="w-full h-auto max-h-[300px] object-contain cursor-pointer"
        @click.stop.prevent="openModal"
      />
    </figure>
    <router-link :to="`/product/${producto.CodProducto}/price`" class="card-body lg:w-1/2 lg:pl-8">
      <h1 class="text-center text-2xl font-bold text-blue-950">{{ producto.CodProducto }}</h1>
      <h2 class="card-title text-center mt-2">{{ producto.Producto }}</h2>
      <p class="text-center">{{ producto.Descripcion }}</p>
      <div class="flex flex-col items-center">
        <p>{{ producto.Medida }}</p>
        <p>{{ findMarcasById(producto.CodMarca)?.Marca }}</p>
      </div>
      <h2 class="text-center font-semibold bg-orange-500 text-white my-2 px-4 py-2 rounded-lg">
        {{ producto.Stock }} {{ producto.Stock === 1 ? ' Unidad' : ' Unidades' }}
      </h2>
      <h2 class="text-blue-950 text-center font-semibold">
        {{ sucursalesInfo }}
      </h2>
      <div class="card-actions justify-center">
        <h2 class="text-3xl mt-4 font-bold text-blue-950">
          {{ formatPrice(producto.Precio) }}
        </h2>
      </div>
    </router-link>

    <!-- MODAL DE IMAGEN EN PANTALLA COMPLETA -->
    <div
      v-if="showModal"
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50"
      @click.stop.prevent="closeModal"
    >
      <!-- IMAGEN CON ZOOM -->
      <img
        :src="producto.Imagen.replace(/:8080/, '')"
        alt="Product Image"
        class="max-w-[90%] max-h-[90%] object-contain cursor-pointer"
        :style="{ transform: `scale(${zoomLevel})` }"
        @click.stop
      />

      <!-- BOTONES DE ZOOM - FIJOS EN LA PANTALLA -->
      <div class="zoom-controls">
        <button class="zoom-btn" @click.stop="zoomIn">+</button>
        <button class="zoom-btn" @click.stop="zoomOut">-</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ProductsResponse } from '../interfaces/products.response';
import { useSucursales } from '../../sucursales/composable/useSucursales';
import { useMarcas } from '../../marcas/composable/useMarcas';
import { formatPrice } from '../../../../common/helpers/formatPrice';

const { findSucursalById } = useSucursales();
const { findMarcasById } = useMarcas();
const producto = defineProps<ProductsResponse>();

const imgDefault = import.meta.env.VITE_BASE_URL.includes('localhost')
  ? import.meta.env.VITE_BASE_URL + 'src/assets/img/No_Image_Available.jpg'
  : 'https://abril.arielbernardo.com/assets/No_Image_Available.jpg';

const sucursalesInfo = producto.Sucursales.map((sucursal) => {
  const nombreSuc = findSucursalById(sucursal.CodSucursal)?.NombreSuc || 'Sucursal desconocida';
  return `${nombreSuc} (${sucursal.Cantidad})`;
}).join(', ');

const showModal = ref(false);
const zoomLevel = ref(1); // Nivel de zoom inicial

// Funciones para abrir y cerrar modal
const openModal = () => {
  showModal.value = true;
  zoomLevel.value = 1; // Resetear el zoom al abrir el modal
};
const closeModal = () => {
  showModal.value = false;
};

// Funciones para aumentar y disminuir zoom
const zoomIn = () => {
  if (zoomLevel.value < 3) zoomLevel.value += 0.2; // Aumenta el zoom hasta un máximo de 3x
};
const zoomOut = () => {
  if (zoomLevel.value > 1) zoomLevel.value -= 0.2; // Reduce el zoom hasta el tamaño normal (1x)
};
</script>

<style scoped>
/* Transición suave del modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Estilos de los botones de zoom */
.zoom-controls {
  position: fixed; /* Fijado en la pantalla */
  bottom: 20px; /* Posición en la parte inferior */
  right: 30px; /* Pegado a la derecha */
  display: flex;
  gap: 10px;
  z-index: 100;
}

.zoom-btn {
  background-color: white;
  color: black;
  font-size: 1.5rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.zoom-btn:hover {
  background-color: gray;
  color: white;
}
</style>
