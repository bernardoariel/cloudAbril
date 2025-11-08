import type { Producto } from '@/interfaces/products.interface';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useProductStore = defineStore('product', () => {
    const products = ref<Producto[]>([]);

    return {
    //* Props

    //* Getters

    //* Actions
        products,
        setProducts(newProducts: Producto[]){
            products.value = newProducts
        }
    };
});
