<template>
  <div class="container mx-auto py-8">
    <h1 class="text-2xl font-bold mb-4 text-center">Detalle del Producto</h1>
    <div v-if="product" class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="md:flex">
        <div class="md:flex-shrink-0 flex items-center justify-center">
          <img
            class="h-48 object-contain md:h-full md:w-48 w-full"
            :src="product.Imagen || imgNotFound"
            alt="Product image"
          />
        </div>
        <div class="p-8">
          <h2 class="text-2xl font-bold text-gray-900">{{ product.Producto }}</h2>
          <p class="mt-2 text-gray-600">{{ product.Descripcion }}</p>
          <div class="mt-4">
            <span class="text-gray-600 font-semibold">Precio: </span>
            <span class="text-gray-900">{{ formatPrice(product.Precio) }}</span>
          </div>
          <div class="mt-2">
            <span class="text-gray-600 font-semibold">Stock: </span>

            <span
              :class="{
                'text-green-500': +product.Stock! > 0,
                'text-red-500': +product.Stock! <= 0,
              }"
            >
              {{ product.Stock! > 0 ? `${product.Stock} disponibles` : 'Agotado' }}
            </span>
          </div>
          <div v-if="product.Sucursales && product.Sucursales.length">
            <span class="text-gray-600 font-semibold">Sucursales:</span>
            <ul>
              <li v-for="(sucursal, index) in product.Sucursales" :key="index">
                {{ findSucursalById(sucursal.CodSucursal)?.NombreSuc }} : {{ sucursal.Cantidad }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-600">Producto no encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useProduct } from '@/composables/useProducts';
import { useSucursales } from '@/modules/sqlserver/sucursales/composable/useSucursales';
import imgNotFound from '@/assets/img/notFound.webp';
import type { Producto } from '@/interfaces/products.interface';
import { formatPrice } from '../common/helpers/formatPrice';
const product = ref<Producto | undefined>(undefined);

const route = useRoute();
const { findSucursalById } = useSucursales();
const { findProductById } = useProduct();

onMounted(() => {
  const productId = route.params.id as string;
  product.value = findProductById(productId);
});
</script>
