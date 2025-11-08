<template>
  <div class="container mx-auto p-2">
    <div class="max-w-4xl mx-auto rounded-lg overflow-hidden">
      <div v-if="isLoading && !isError" class="flex justify-center items-center p-10">
        <LoaderComponent v-bind="ConfigLoader" />
      </div>
      <ErrorComponent v-if="isError && !isLoading" />
      <div v-else-if="!isLoading && !isError && producto">
        <ProductCard v-bind="producto" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import ProductCard from '@/modules/sqlserver/products/components/ProductCard.vue';
import LoaderComponent from '@/common/components/LoaderComponent.vue';
import ErrorComponent from './ErrorComponent.vue';
import { useProduct } from '@/modules/sqlserver/products/composable/useProduct';

const { params } = useRoute();

interface AttrLoader {
  size: number;
  color: string;
}
const ConfigLoader: AttrLoader = {
  size: 80,
  color: '#000',
};

const { producto, isLoading, isError } = useProduct({ id: +params.id });
</script>
