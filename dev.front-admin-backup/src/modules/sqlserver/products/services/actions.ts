import { type Producto } from '../../../../interfaces/products.interface';
import { abrilApiData } from '@/api/abrilApiData';
import axios from 'axios';

interface GetProductsOptions {
  term: string;
}

export const getProducts = async (): Promise<Producto[]> => {
  try {
    const { data } = await abrilApiData.get<Producto[]>(`productos`);
    console.log('data::: ', data);
    return data.result;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al obtener productos:', error.response?.data || error.message);
    } else {
      console.error('Error inesperado:', error);
    }
    // Puedes lanzar el error o manejarlo según sea necesario
    throw new Error('No se pudieron obtener los productos. Inténtalo de nuevo más tarde.');
  }
};
export const getProductsStock = async (): Promise<ProductsStockResponse[]> => {
  try {
    const { data } = await abrilApiData.get<ProductsStockResponse[]>(`prod-stock`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error al obtener productos:', error.response?.data || error.message);
    } else {
      console.error('Error inesperado:', error);
    }
    // Puedes lanzar el error o manejarlo según sea necesario
    throw new Error('No se pudieron obtener los productos. Inténtalo de nuevo más tarde.');
  }
};

export const getProductById = async (term: number | string): Promise<Producto> => {
  try {
    const { data } = await abrilApiData.get<Producto>(`/productos/${term}`);
    if (!data) {
      throw new Error('Producto no encontrado');
    }
    return data;
  } catch (error) {
    console.error('Error fetching product by term: ', error);
    throw error;
  }
};

export const getProductByMarcas = async ({ term }: GetProductsOptions): Promise<Producto[]> => {
  try {
    console.log('Fetching marcas with term: ', term);
    const { data } = await abrilApiData.get<Producto[]>(`productos/${term}/marcas`);
    return data;
  } catch (error) {
    console.error('Error fetching products for marca:', error);
    throw error;
  }
};
export const sleep = (seconds: number): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });
};
