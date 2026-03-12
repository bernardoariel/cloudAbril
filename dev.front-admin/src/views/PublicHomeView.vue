<template>
  <div class="w-full">
    
    <!-- HERO con buscador -->
    <section class="hero-section py-12 px-4">
      <div class="max-w-5xl mx-auto text-center">
        <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-md">Encontrá lo que buscás</h2>
        <p class="text-white/80 text-lg mb-8">Los mejores productos, las mejores opciones de pago</p>
        
        <!-- BUSCADOR reutilizando la misma lógica que SearchProductView -->
        <div class="bg-white rounded-2xl shadow-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          
          <!-- Input de búsqueda -->
          <div class="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              ref="searchInput"
              v-model="searchTerm" 
              type="text" 
              placeholder="Buscar producto o marca..." 
              class="input input-bordered w-full pl-10 bg-gray-50 focus:bg-white"
              @keyup.enter="handleSearch"
              @focus="isInputFocused = true"
              @blur="handleBlur"
              @keydown.down.prevent="handleKeyDown"
              @keydown.up.prevent="handleKeyUp"
            />
            <!-- Dropdown de sugerencias como SearchProductView -->
            <ul
              v-if="currentItems.length > 0 && isInputFocused"
              class="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl z-50 shadow-xl border border-gray-200 max-h-64 overflow-y-auto"
            >
              <li
                v-for="(item, index) in currentItems"
                :key="item.CodProducto || item.CodMarca"
                @mousedown.prevent="handleItemClick(item)"
                :class="{ 'bg-orange-50 text-orange-700 font-semibold': selectedIndex === index }"
                class="px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0"
              >
                {{ item.name }}
                <span v-if="item.type === 'product'" class="text-xs text-gray-400 ml-2">{{ item.CodProducto }}</span>
                <span v-else class="text-xs text-purple-500 ml-2 font-medium">Marca</span>
              </li>
            </ul>
          </div>

          <!-- Filtro Sucursal (datos reales de Pinia) -->
          <select v-model="selectedSucursal" class="select select-bordered bg-gray-50 focus:bg-white md:max-w-[200px]">
            <option :value="null">Todas las Sucursales</option>
            <option v-for="suc in sucursales" :key="suc.CodSucursal" :value="suc.CodSucursal">
              {{ suc.NombreSuc }}
            </option>
          </select>

          <!-- Botón Buscar -->
          <button @click="handleSearch" class="btn-buscar">
            Buscar
          </button>
        </div>
      </div>
    </section>

    <!-- LOADING -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
      <span class="loading loading-spinner loading-lg" style="color: var(--brand-cta);"></span>
      <p class="text-xl font-medium mt-4" style="color: var(--brand-cta);">Cargando catálogo...</p>
    </div>

    <!-- PRODUCTOS -->
    <div v-else class="max-w-7xl mx-auto px-4 md:px-8 py-10">

      <!-- Filtro por Marcas -->
      <div class="flex flex-wrap gap-2 mb-8">
        <button 
          v-for="marca in displayMarcas" 
          :key="marca.CodMarca"
          @click="toggleMarca(marca.CodMarca)"
          :class="selectedMarca === marca.CodMarca ? 'marca-btn-active' : 'marca-btn'"
        >
          {{ marca.Marca }}
        </button>
        <button v-if="selectedMarca" @click="selectedMarca = null" class="marca-btn text-red-500 border-red-300 hover:bg-red-50">
          ✕ Limpiar
        </button>
      </div>

      <!-- TITULO SECCION -->
      <div class="flex items-center justify-between mb-8">
        <h3 class="text-2xl md:text-3xl font-bold text-gray-800 section-title">
          <span class="section-title-accent"></span>
          {{ selectedMarca ? 'Productos de la marca' : 'Destacados para vos' }}
        </h3>
        <span class="text-sm text-gray-400">{{ filteredProducts.length }} productos</span>
      </div>

      <!-- GRILLA DE PRODUCTOS -->
      <div v-if="displayProducts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        <div 
          v-for="(prod, index) in displayProducts" 
          :key="prod.CodProducto" 
          class="product-card group cursor-pointer"
          @click="goToProduct(prod.CodProducto)"
        >
          <!-- Imagen -->
          <div class="product-card-img">
            <img 
              :src="prod.Imagen ? prod.Imagen.replace(/:8080/, '') : `https://abril.arielbernardo.com/public_image/productos/${prod.CodProducto}-0.jpg`" 
              :alt="prod.Producto"
              class="product-img group-hover:scale-105 transition-transform duration-500"
              @error="(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.errored) { img.dataset.errored = '1'; img.src = imgDefault; } }"
            />
          </div>

          <!-- Info -->
          <div class="p-4">
            <p class="text-xs font-semibold mb-1 product-brand">{{ findMarcasById(prod.CodMarca)?.Marca || '' }}</p>
            <h4 class="font-bold text-gray-800 text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-orange-600 transition-colors">
              {{ prod.Producto }}
            </h4>
            <p class="text-xs text-gray-400 mt-1">{{ prod.Descripcion }}</p>
            
            <div class="mt-3 flex items-end justify-between">
              <div>
                <p class="text-xs text-gray-400 line-through">{{ formatPrice(prod.Precio) }}</p>
                <p class="text-xl font-black product-price">{{ formatPrice(prod.Precio * 0.82) }}</p>
                <p class="text-[10px] text-green-600 font-bold">18% OFF CONTADO</p>
              </div>
              <span class="text-xs text-gray-400">{{ prod.Stock }} {{ prod.Stock === 1 ? 'unidad' : 'unidades' }}</span>
            </div>

            <!-- Sucursales -->
            <div class="mt-2 flex flex-wrap gap-1">
              <template v-for="suc in prod.Sucursales" :key="suc.CodSucursal">
                <span 
                  v-if="!findSucursalById(suc.CodSucursal)?.NombreSuc?.toUpperCase().startsWith('SERV')"
                  class="badge-suc"
                >
                  {{ findSucursalById(suc.CodSucursal)?.NombreSuc || 'Suc.' }} ({{ suc.Cantidad }})
                </span>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- VACIO -->
      <div v-else class="text-center py-20">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <p class="text-lg text-gray-400 font-medium">No se encontraron productos</p>
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-10">
        <!-- Anterior -->
        <button 
          @click="goToPage(currentPage - 1)" 
          :disabled="currentPage === 1"
          class="page-arrow" 
          :class="{ 'opacity-30 cursor-not-allowed': currentPage === 1 }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>

        <!-- Primera página -->
        <button v-if="visiblePages[0] > 1" @click="goToPage(1)" class="page-btn">1</button>
        <span v-if="visiblePages[0] > 2" class="px-1 text-gray-400">...</span>

        <!-- Páginas visibles -->
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="goToPage(page)"
          :class="currentPage === page ? 'page-btn-active' : 'page-btn'"
        >
          {{ page }}
        </button>

        <!-- Última página -->
        <span v-if="visiblePages[visiblePages.length - 1] < totalPages - 1" class="px-1 text-gray-400">...</span>
        <button v-if="visiblePages[visiblePages.length - 1] < totalPages" @click="goToPage(totalPages)" class="page-btn">{{ totalPages }}</button>

        <!-- Siguiente -->
        <button 
          @click="goToPage(currentPage + 1)" 
          :disabled="currentPage === totalPages"
          class="page-arrow" 
          :class="{ 'opacity-30 cursor-not-allowed': currentPage === totalPages }"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProducts } from '../modules/sqlserver/products/composable/useProducts';
import { useSucursales } from '../modules/sqlserver/sucursales/composable/useSucursales';
import { useMarcas } from '../modules/sqlserver/marcas/composable/useMarcas';
import { formatPrice } from '../common/helpers/formatPrice';
import imgDefault from '@/assets/img/No_Image_Available.jpg';

const router = useRouter();
const searchTerm = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const isInputFocused = ref(false);
const selectedIndex = ref(-1);
const selectedSucursal = ref<number | null>(null);
const selectedMarca = ref<number | null>(null);
const currentPage = ref(1);
const itemsPerPage = 12;

// Composables existentes
const { productos, isLoading } = useProducts();
const { sucursales, findSucursalById } = useSucursales();
const { marcas, findMarcasById } = useMarcas();

// Variables para la imagen

// Marcas que existen en los productos para filtro
const displayMarcas = computed(() => {
  if (!productos.value) return [];
  const usedMarcaIds = [...new Set(productos.value.map(p => p.CodMarca))];
  return marcas.value.filter(m => usedMarcaIds.includes(m.CodMarca)).slice(0, 15);
});

// Items para el dropdown de autocompletado (misma lógica que SearchProductView)
const allItems = computed(() => {
  const combined = [
    ...productos.value.map(p => ({
      type: 'product' as const,
      CodProducto: p.CodProducto,
      CodMarca: null as number | null,
      name: p.Producto || '',
    })),
    ...marcas.value.map(m => ({
      type: 'marca' as const,
      CodProducto: null as string | null,
      CodMarca: m.CodMarca,
      name: m.Marca || '',
    })),
  ];
  return combined;
});

const filteredSuggestions = computed(() => {
  if (searchTerm.value.length >= 3) {
    const terms = searchTerm.value.toLowerCase().split(' ');
    return allItems.value.filter(item =>
      terms.every(term => item.name?.toLowerCase().includes(term))
    );
  }
  selectedIndex.value = -1;
  return [];
});

const currentItems = computed(() => {
  return filteredSuggestions.value.slice(0, 10);
});

// Productos filtrados para la grilla 
const filteredProducts = computed(() => {
  if (!productos.value) return [];
  let result = [...productos.value];
  
  // Filtrar por marca
  if (selectedMarca.value) {
    result = result.filter(p => p.CodMarca === selectedMarca.value);
  }
  
  // Filtrar por sucursal
  if (selectedSucursal.value) {
    result = result.filter(p => 
      p.Sucursales.some(s => s.CodSucursal === selectedSucursal.value)
    );
  }
  
  // Filtrar por búsqueda
  if (searchTerm.value.length >= 3) {
    const terms = searchTerm.value.toLowerCase().split(' ');
    result = result.filter(p =>
      terms.every(t => 
        (p.Producto && p.Producto.toLowerCase().includes(t)) ||
        (p.Descripcion && p.Descripcion.toLowerCase().includes(t))
      )
    );
  }
  
  return result;
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage));

const displayProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredProducts.value.slice(start, start + itemsPerPage);
});

// Paginación inteligente: muestra máx 5 páginas alrededor de la actual
const visiblePages = computed(() => {
  const maxVisible = 5;
  const pages: number[] = [];
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 400, behavior: 'smooth' });
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  isInputFocused.value = false;
};

const handleBlur = () => {
  setTimeout(() => { isInputFocused.value = false; }, 200);
};

const handleItemClick = (item: any) => {
  if (item.type === 'product' && item.CodProducto) {
    router.push({ name: 'publicProductDetail', params: { id: item.CodProducto } });
  } else if (item.type === 'marca' && item.CodMarca) {
    selectedMarca.value = item.CodMarca;
    searchTerm.value = '';
    isInputFocused.value = false;
  }
};

const handleKeyDown = () => {
  if (selectedIndex.value < currentItems.value.length - 1) selectedIndex.value++;
};
const handleKeyUp = () => {
  if (selectedIndex.value > 0) selectedIndex.value--;
};

const toggleMarca = (codMarca: number) => {
  selectedMarca.value = selectedMarca.value === codMarca ? null : codMarca;
  currentPage.value = 1;
};

const goToProduct = (id: string | number) => {
  router.push({ name: 'publicProductDetail', params: { id } });
};

onMounted(() => {
  searchInput.value?.focus();
});
</script>

<style scoped>
/* Hero con colores Abril (púrpura/magenta) */
.hero-section {
  background: linear-gradient(135deg, var(--brand-dark) 0%, var(--brand-primary) 40%, var(--brand-light) 70%, var(--brand-cta) 100%);
}

/* Botón de búsqueda */
.btn-buscar {
  background-color: var(--brand-cta);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 0.75rem;
  font-weight: 700;
  transition: all 0.3s;
  white-space: nowrap;
}
.btn-buscar:hover {
  filter: brightness(1.15);
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  transform: translateY(-1px);
}

/* Filtros de marcas */
.marca-btn {
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  border: 1.5px solid #e5e7eb;
  background: white;
  color: #4b5563;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}
.marca-btn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
  background: #f3e8ff;
}
.marca-btn-active {
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  border: 1.5px solid var(--brand-primary);
  background: var(--brand-primary);
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

/* Título de sección */
.section-title {
  position: relative;
  padding-left: 1rem;
}
.section-title-accent {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--brand-cta) 0%, var(--brand-primary) 100%);
}

/* Cards de productos */
.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
.product-card:hover {
  box-shadow: 0 12px 32px rgba(155, 48, 255, 0.12);
  transform: translateY(-4px);
  border-color: #e5d5ff;
}
.product-card-img {
  aspect-ratio: 1;
  background: white;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  position: relative;
}
.product-card-img::after {
  content: '';
  position: absolute;
  inset: 0;
  border-bottom: 1px solid #f0ecf5;
}
.product-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.08));
}

/* Precio */
.product-price {
  color: var(--brand-cta);
}

/* Paginación */
.page-btn {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 0.5rem;
}
.page-btn:hover {
  border-color: var(--brand-cta);
  color: var(--brand-cta);
  background: #fff7ed;
}
.page-btn-active {
  min-width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--brand-cta);
  background: var(--brand-cta);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0 0.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.page-arrow {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}
.page-arrow:hover:not(:disabled) {
  border-color: var(--brand-cta);
  color: var(--brand-cta);
  background: #fff7ed;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Nombre de marca en card */
.product-brand {
  color: var(--brand-primary);
}

/* Badge de sucursales con color de paleta */
.badge-suc {
  font-size: 10px;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: white;
  border: 1px solid var(--brand-primary);
  color: var(--brand-primary);
  font-weight: 500;
}
</style>
