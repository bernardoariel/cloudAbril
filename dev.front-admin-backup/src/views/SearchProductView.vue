<template>
  <div class="w-full h-full bg-orange-200">
    <div class="flex flex-col h-full justify-start items-center pt-10">
      <div class="relative w-full max-w-lg px-4">
        <p v-if="isLoading" class="text-orange-600 text-center text-4xl mt-2">Cargando productos</p>
        <div v-else class="flex items-center w-full bg-orange-200">
          <!-- Contenedor del input y loader -->
          <label
            class="input input-bordered flex items-center gap-2 grow h-12 relative w-full text-orange-900 bg-orange-300"
          >
            <input
              ref="searchInput"
              v-model="searchTerm"
              type="text"
              placeholder="Buscar"
              class="grow outline-none h-full pr-10 w-full"
              @focus="isInputFocused = true"
              @blur="isInputFocused = false"
              @keydown.down.prevent="handleKeyDown"
              @keydown.up.prevent="handleKeyUp"
              @keydown.enter.prevent="selectProduct"
            />
          </label>
          <button
            @click="handleSearch"
            class="btn bg-orangeCustom hover:bg-orangeCustom2 text-white ml-2 h-12"
          >
            Buscar
          </button>
        </div>

        <!-- Dropdown de resultados -->

        <ul
          v-if="currentItems.length > 0"
          class="menu dropdown-content bg-base-100 rounded-box z-[1] w-100 p-2 shadow"
        >
          <li
            v-for="(item, index) in currentItems"
            :key="item.CodProducto || item.CodMarca"
            @click="handleItemClick(item)"
            :class="{ highlight: selectedIndex === index }"
          >
            <a
              >{{ item.name }}
              <span v-if="item.type === 'product'">- {{ item.CodProducto }}</span></a
            >
          </li>
        </ul>
      </div>
    </div>
    <div
      v-if="currentItems.length === 0 && !isInputFocused"
      class="absolute bottom-28 w-full flex justify-center"
    >
      <img src="../assets/img/logo.png" alt="imagen" class="w-48 opacity-60 h-auto" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { useSucursales } from '../modules/sqlserver/sucursales/composable/useSucursales';
import { useFormaPago } from '../modules/sqlserver/forma-pago/composable/useFormaPago';
import { useMarcas } from '../modules/sqlserver/marcas/composable/useMarcas';
import { useProducts } from '../modules/sqlserver/products/composable/useProducts';

const { sucursales } = useSucursales();
// const { tarjetas } = useFormaPago();
const { findMarcasById, marcas } = useMarcas();
const { productos, isLoading } = useProducts();

const itemsPerPage = ref(10); // Definir la cantidad de elementos que quieres mostrar por página
const currentPage = ref(1); // Página inicial
const router = useRouter();
const searchTerm = ref('');
const route = useRoute();
const selectedIndex = ref(-1);
const isInputFocused = ref(false);
const searchInput = ref(null);
onMounted(() => {
  const search = route.query.search || ''; // Obtén el término de búsqueda
  const marca = route.query.marca || ''; // Obtén la marca
  const descripcion = route.query.descripcion || ''; // Obtén la descripción

  // Une los términos en una cadena separada por comas
  searchTerm.value = [search, marca, descripcion].filter(Boolean).join(',');
  searchInput.value?.focus();
});
const allItems = computed(() => {
  const combinedItems = [
    ...productos.value.map((producto) => ({
      type: 'product',
      CodProducto: producto.CodProducto,
      name: producto.Producto || '', // Evitar null en nombre de producto
    })),
    ...marcas.value.map((marca) => ({
      type: 'marca',
      CodMarca: marca.CodMarca,
      name: marca.Marca || '', // Evitar null en nombre de marca
    })),
  ];
  return combinedItems;
});

const filteredItems = computed(() => {
  if (searchTerm.value.length >= 3) {
    const searchTerms = searchTerm.value.toLowerCase().split(' ');
    return allItems.value.filter((item) =>
      searchTerms.every((term) => item.name?.toLowerCase().includes(term)),
    );
  }
  selectedIndex.value = -1;
  return [];
});
const handleItemClick = (item) => {
  if (item.type === 'product' && item.CodProducto) {
    router.replace(`/product/${item.CodProducto}`);
  } else if (item.type === 'marca' && item.CodMarca) {
    router.replace({
      name: 'productList',
      query: { search: item.name, searchByMarcas: 'true' },
    });
  } else {
    console.warn('Elemento sin ID válido:', item);
  }
};

// Manejar las teclas "Down" (Abajo)
const handleKeyDown = () => {
  if (selectedIndex.value < filteredItems.value.length - 1) {
    selectedIndex.value++;
  }
};

// Manejar las teclas "Up" (Arriba)
const handleKeyUp = () => {
  if (selectedIndex.value > 0) {
    selectedIndex.value--;
  }
};
const currentItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredItems.value.slice(start, end);
});
// Seleccionar producto con "Enter"
const selectProduct = () => {
  if (selectedIndex.value >= 0 && selectedIndex.value < filteredItems.value.length) {
    handleItemClick(filteredItems.value[selectedIndex.value]);
  }
};
const handleSearch = async () => {
  const term = searchTerm.value.trim();
  if (!term) return;

  // Verifica si es un número
  const isNumber = !isNaN(Number(term));

  if (isNumber) {
    // Redirige directamente al detalle del producto usando el código como ID
    router.replace(`/product/${term}`);
    return;
  }

  // Procesa términos separados por comas
  const terms = term.split(',').map((t) => t.trim());

  if (terms.length === 1) {
    // Si no hay comas, redirige a la búsqueda general
    router.replace({
      name: 'productList',
      query: { search: terms[0] },
    });
  } else if (terms.length === 2) {
    // Si hay una coma, redirige con búsqueda por marca
    router.replace({
      name: 'productList',
      query: { search: terms[0], marca: terms[1] },
    });
  } else if (terms.length >= 3) {
    // Si hay tres términos, incluye la descripción
    router.replace({
      name: 'productList',
      query: {
        search: terms[0],
        marca: terms[1],
        descripcion: terms[2],
      },
    });
  }
};
const updateSearchTermFromUrl = () => {
  const search = route.query.search || '';
  const marca = route.query.marca || '';
  const descripcion = route.query.descripcion || '';

  searchTerm.value = [search, marca, descripcion].filter(Boolean).join(',');
};
watch(
  () => route.query,
  () => {
    updateSearchTermFromUrl();
  },
  { immediate: true },
);
</script>

<style scoped>
.highlight {
  background-color: #ffff00; /* Un amarillo claro para resaltar */
  color: #000; /* Cambia el color del texto a negro */
  font-weight: bold; /* Mantén el texto en negrita */
  padding: 0 2px; /* Un pequeño relleno alrededor del texto resaltado */
  border-radius: 3px; /* Bordes ligeramente redondeados */
}
input::placeholder {
  color: #ef7e00; /* Color para el texto del placeholder */
  opacity: 1;
}
</style>
