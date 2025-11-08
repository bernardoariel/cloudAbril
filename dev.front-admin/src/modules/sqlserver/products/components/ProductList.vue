<template>
  <div>
    <!-- Botones de marcas -->
    <div class="flex flex-wrap mb-4">
      <button
        v-for="marca in uniqueMarcas"
        :key="marca.CodMarca"
        class="btn mx-1 my-1"
        :class="{
          'btn-primary': selectedMarca === marca.CodMarca,
          'btn-outline': selectedMarca !== marca.CodMarca,
        }"
        @click="filterByMarca(marca.CodMarca)"
      >
        {{ marca.Marca }}
        <div class="badge badge-secondary">{{ countProductsByMarca(marca.CodMarca) }}</div>
      </button>
    </div>

    <!-- Lista de productos -->
    <div v-for="(prod, index) in filteredProducts" :key="prod.CodProducto">
      <router-link :to="`/product/${prod.CodProducto}`" :class="[...styles(index)]">
        <!-- CONTENIDO DEL PRODUCTO -->
        <div class="flex items-center justify-between">
          <div class="flex flex-col w-full">
            <!-- FILA 1 -->
            <div class="flex justify-between w-full mb-2">
              <h3 class="font-medium text-lg badge badge-ghost badge-outline mt-1">
                {{ prod.CodProducto }}
              </h3>

              <p class="mt-1 text-xs">
                {{ prod.Medida }}
              </p>

              <h3 class="text-sm leading-none font-medium badge badge-neutral">
                {{ findMarcasById(prod.CodMarca)?.Marca }}
              </h3>
            </div>

            <!-- FILA 2 -->
            <div class="flex justify-center w-full">
              <h3 class="font-medium text-lg text-center">{{ prod.Producto }}</h3>
            </div>

            <!-- FILA 3 -->
            <div class="block w-full mb-1">
              <h3 class="font-medium text-sm text-center">
                <small>{{ prod.Descripcion }}</small>
              </h3>
            </div>

            <!-- Detalles -->
            <div class="flex items-center justify-between">
              <div class="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-md overflow-hidden mx-5">
                <img
                  v-if="prod.Imagen"
                  :src="prod.Imagen ? prod.Imagen.replace(/:8080/, '') : imgDefault"
                  alt="Imagen del producto"
                  class="w-full h-auto object-cover rounded-md"
                />
              </div>

              <div class="flex flex-col h-full">
                <div class="flex items-start">
                  <h3 class="text-sm leading-none">{{ prod.Stock }} Unidades</h3>
                </div>
                <div class="flex items-center">
                  <h3 class="text-sm leading-none font-semibold">
                    Precio de Lista: {{ formatPrice(prod.Precio) }}
                  </h3>
                </div>
                <div class="flex items-end">
                  <h3 class="text-sm leading-none">{{ prod.Medida }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { ProductsResponse } from '../interfaces/products.response';
import { formatPrice } from '../../../../common/helpers/formatPrice';
import { useMarcas } from '../../marcas/composable/useMarcas';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{ productos: ProductsResponse[] }>();
const { findMarcasById, marcas } = useMarcas(); // Accedemos a las marcas desde TanStack Query
const route = useRoute();
const router = useRouter();
const marcaQuery = computed(() => route.query.marca || '');
const imgDefault = import.meta.env.VITE_BASE_URL.includes('localhost')
  ? import.meta.env.VITE_BASE_URL + 'src/assets/img/No_Image_Available.jpg'
  : 'https://abril.arielbernardo.com/assets/No_Image_Available.jpg';

// Estado para la marca seleccionada
const selectedMarca = ref<number | null>(null);
const selectedDescripcion = ref<string | null>(null);
// Propiedad computada para obtener marcas únicas
const uniqueMarcas = computed(() => {
  const marcasList = props.productos.map((prod) => findMarcasById(prod.CodMarca));
  return [...new Map(marcasList.filter(Boolean).map((marca) => [marca.CodMarca, marca])).values()];
});

// Propiedad computada para filtrar productos
const filteredProducts = computed(() => {
  return props.productos.filter((prod) => {
    const matchesMarca = !selectedMarca.value || prod.CodMarca === selectedMarca.value;
    const matchesDescripcion =
      !selectedDescripcion.value ||
      prod.Medida.toLowerCase().includes(selectedDescripcion.value.toLowerCase());
    return matchesMarca && matchesDescripcion;
  });
});

// Función para seleccionar una marca
const filterByMarca = (CodMarca: number) => {
  selectedMarca.value = selectedMarca.value === CodMarca ? null : CodMarca;

  // Actualizamos la URL con la marca seleccionada
  router.replace({
    query: {
      ...route.query,
      marca: selectedMarca.value ? findMarcasById(selectedMarca.value)?.Marca : undefined,
    },
  });
};

// Función para filtrar por descripción
const filterByDescripcion = (descripcion: string) => {
  selectedDescripcion.value = descripcion || null;

  // Actualizamos la URL con la descripción seleccionada
  router.replace({
    query: {
      ...route.query,
      descripcion: selectedDescripcion.value || undefined,
    },
  });
};

// Función para contar productos por marca
const countProductsByMarca = (CodMarca: number) => {
  return props.productos.filter((prod) => {
    const matchesMarca = prod.CodMarca === CodMarca;
    const matchesDescripcion =
      !selectedDescripcion.value || // Si no hay descripción seleccionada, no filtra
      prod.Medida.toLowerCase().includes(selectedDescripcion.value.toLowerCase());

    return matchesMarca && matchesDescripcion; // Devuelve true solo si ambas condiciones se cumplen
  }).length;
};

// Clase dinámica para estilos
const styles = (index: number) => [
  'flex flex-col p-4 mb-2 shadow-md hover:shadow-lg rounded-2xl relative transition-transform duration-300 transform hover:-translate-y-1',
  index % 2 === 0 ? 'bg-white' : 'bg-gray-800 text-white',
];

// Actualiza el selectedMarca basado en un término parcial
onMounted(() => {
  // Manejar marca desde la URL
  if (marcaQuery.value) {
    const match = uniqueMarcas.value.find((marca) =>
      marca.Marca.toLowerCase().includes(marcaQuery.value.toLowerCase()),
    );
    selectedMarca.value = match?.CodMarca || null; // Asigna el CodMarca de la coincidencia parcial
  }

  // Manejar descripción desde la URL
  const descripcionQuery = route.query.descripcion || '';
  if (descripcionQuery) {
    selectedDescripcion.value = descripcionQuery as string;
  }
});
</script>
