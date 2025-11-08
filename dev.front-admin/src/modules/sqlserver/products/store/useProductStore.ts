import type { Producto } from '@/interfaces/products.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ProductsStockResponse } from '../interfaces/productsStock.response';

export const useProductStore = defineStore('useProductStore', () => {
  const productos = ref<Producto | Producto[]>([]);
  const productCantidad = ref<ProductsStockResponse | ProductsStockResponse[]>([]);

  return {
    //* Props
    productos,
    productCantidad,

    //* Getters

    //* Actions
    setProducts(newProducts: Producto[]) {
      productos.value = newProducts;
    },
    setProductStock(newProductCantidad: ProductsStockResponse[]) {
      productCantidad.value = newProductCantidad;
    },
  };
});
