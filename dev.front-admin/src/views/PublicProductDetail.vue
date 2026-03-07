<template>
  <div class="py-8 px-4 md:px-8">
    <div class="max-w-5xl mx-auto">
      
      <!-- Volver -->
      <button @click="goBack" class="flex items-center gap-2 mb-6 text-purple-600 hover:text-purple-800 font-semibold transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        Volver al catálogo
      </button>

      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center items-center py-20">
        <span class="loading loading-spinner loading-lg" style="color: #EF7E00;"></span>
      </div>
      
      <!-- Error -->
      <div v-else-if="isError" class="text-center py-20">
        <p class="text-lg text-gray-400 font-medium">No se pudo cargar el producto.</p>
      </div>

      <!-- Producto -->
      <div v-else-if="producto" class="flex flex-col gap-8">
        
        <!-- Card Principal -->
        <div class="product-detail-card md:flex">
          <!-- Imagen -->
          <div class="w-full md:w-2/5 bg-white flex items-center justify-center p-8 min-h-[350px] relative overflow-hidden">
            <img 
              :src="producto.Imagen ? producto.Imagen.replace(/:8080/, '') : `https://abril.arielbernardo.com/public_image/productos/${producto.CodProducto}-0.jpg`" 
              :alt="producto.Producto"
              class="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-110 transition-transform duration-500"
              @click="openModal"
              @error="(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.errored) { img.dataset.errored = '1'; img.src = imgDefault; } }"
            />
          </div>
          
          <!-- Info -->
          <div class="w-full md:w-3/5 p-6 md:p-8 flex flex-col">
            <span class="text-xs font-bold text-purple-600 uppercase mb-1">{{ findMarcasById(producto.CodMarca)?.Marca || '' }}</span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-gray-800 mb-1">{{ producto.Producto }}</h2>
            <p class="text-sm text-gray-500 mb-1">Código: {{ producto.CodProducto }}</p>
            <p class="text-gray-600 mb-2">{{ producto.Descripcion }}</p>
            <p class="text-sm text-gray-400 mb-4">{{ producto.Medida }}</p>
            
            <!-- Precios -->
            <div class="price-box mb-6">
              <div class="flex items-center gap-4 flex-wrap">
                <div>
                  <p class="text-xs text-gray-400 uppercase font-semibold">Contado</p>
                  <p class="text-3xl font-black" style="color: #EF7E00;">{{ formatPrice(producto.Precio * 0.82) }}</p>
                  <p class="text-xs text-green-600 font-bold">18% OFF</p>
                </div>
                <div class="w-px h-12 bg-gray-200"></div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-semibold">Débito</p>
                  <p class="text-2xl font-bold text-gray-700">{{ formatPrice(producto.Precio * 0.9) }}</p>
                  <p class="text-xs text-green-500 font-medium">10% OFF</p>
                </div>
                <div class="w-px h-12 bg-gray-200"></div>
                <div>
                  <p class="text-xs text-gray-400 uppercase font-semibold">Lista</p>
                  <p class="text-2xl font-bold text-gray-700">{{ formatPrice(producto.Precio) }}</p>
                </div>
              </div>
            </div>

            <!-- Stock y Sucursales -->
            <div class="mb-6">
              <div class="stock-badge mb-3">
                {{ producto.Stock }} {{ producto.Stock === 1 ? 'unidad disponible' : 'unidades disponibles' }}
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="suc in producto.Sucursales" 
                  :key="suc.CodSucursal"
                  class="text-xs px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium border border-purple-100"
                >
                  {{ findSucursalById(suc.CodSucursal)?.NombreSuc || 'Sucursal' }}: {{ suc.Cantidad }} un.
                </span>
              </div>
            </div>

            <!-- Consultar WhatsApp -->
            <button class="btn-whatsapp mt-auto" @click="contactWhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              Consultar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL de imagen fullscreen -->
    <div
      v-if="showModal && producto?.CodProducto"
      class="fixed inset-0 flex items-center justify-center bg-black/80 z-50 cursor-pointer"
      @click="closeModal"
    >
      <img
        :src="producto.Imagen ? producto.Imagen.replace(/:8080/, '') : `https://abril.arielbernardo.com/public_image/productos/${producto.CodProducto}-0.jpg`"
        :alt="producto.Producto"
        class="max-w-[90%] max-h-[90%] object-contain"
        @click.stop
        @error="(e) => { const img = e.target as HTMLImageElement; if (!img.dataset.errored) { img.dataset.errored = '1'; img.src = imgDefault; } }"
      />
      <button class="absolute top-4 right-4 text-white text-3xl hover:text-orange-400" @click="closeModal">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProduct } from '@/modules/sqlserver/products/composable/useProduct';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import { useMarcas } from '@/modules/sqlserver/marcas/composable/useMarcas';
import { formatPrice } from '@/common/helpers/formatPrice';
import imgDefault from '@/assets/img/No_Image_Available.jpg';

const route = useRoute();
const router = useRouter();
const showModal = ref(false);

const productId = route.params.id as string;
const { producto, isLoading, isError } = useProduct({ id: +productId });
const { findSucursalById } = useSucursales();
const { findMarcasById } = useMarcas();

const goBack = () => router.back();

const openModal = () => { showModal.value = true; };
const closeModal = () => { showModal.value = false; };

const contactWhatsApp = () => {
  const name = producto.value?.Producto || 'producto';
  const code = producto.value?.CodProducto || '';
  const msg = `Hola! Estoy interesado en: ${name} (Código: ${code}). Me darían más información?`;
  const phone = import.meta.env.VITE_WHATSAPP_CONTACT_NUMBER || '';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
};
</script>

<style scoped>
.product-detail-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid #f3f4f6;
}

.price-box {
  background: linear-gradient(135deg, #fef3e2 0%, #fff 100%);
  padding: 1.25rem;
  border-radius: 1rem;
  border: 1px solid #fed7aa;
}

.stock-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  border-radius: 2rem;
  background: linear-gradient(90deg, #9B30FF, #C850C0);
  color: white;
  font-weight: 700;
  font-size: 0.8rem;
}

.btn-whatsapp {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #25D366;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 1rem;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}
.btn-whatsapp:hover {
  background-color: #1DA851;
  box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  transform: translateY(-2px);
}

</style>
