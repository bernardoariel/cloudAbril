<template>
  <div class="p-3 pb-16">
    <div v-if="!searchQuery && !isLoading" class="flex justify-center items-center p-10">
      <p>No has ingresado ninguna búsqueda.</p>
    </div>

    <ProductList v-if="productos && !isLoading" :productos="productos" />
    <div v-if="isLoading && !isError" class="flex justify-center items-center p-10">
      <LoaderComponent v-bind="ConfigLoader" />
    </div>
    <div v-if="isError && !isLoading" class="flex justify-center items-center p-10">
      <NotMatchComponent
        :button-text="'Volver'"
        :title="'Productos no encontrados!'"
        :redirectUrl="'/'"
        :message="errorMessage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ProductList from '@/modules/sqlserver/products/components/ProductList.vue';
import LoaderComponent from '@/common/components/LoaderComponent.vue';
import NotMatchComponent from '@/common/components/NotMatchComponent.vue';
import { useProductsByTerm } from '../modules/sqlserver/products/composable/useProductsByTerm';

interface AttrLoader {
  size: number;
  color: string;
}

const ConfigLoader: AttrLoader = {
  size: 80,
  color: '#000',
};

const { query } = useRoute();
const searchQuery = (query.search as string) || '';
const searchByMarcas = query.searchByMarcas === 'true';

const { productos, isLoading, isError, error } = useProductsByTerm({
  term: searchQuery,
  searchByMarcas,
});

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const errorMessage =
  (error as ErrorResponse)?.response?.data?.message ||
  `No se encontraron productos o marcas con el término ${searchQuery}`;
</script>
