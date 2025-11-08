import { type VendedorResponse } from '../interfaces/vendedores.interface';
import { abrilApiData } from '@/api/abrilApiData';

export const getVendedores = async (): Promise<VendedorResponse[]> => {
  const { data } = await abrilApiData.get<VendedorResponse[]>('/vendedores');
  return data;
};
