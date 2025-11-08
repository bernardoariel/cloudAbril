import { type CobradorResponse } from '../interfaces/cobrador.interface';
import { abrilApiData } from '@/api/abrilApiData';

export const getCobradores = async (): Promise<CobradorResponse[]> => {
  const { data } = await abrilApiData.get<CobradorResponse[]>('/cobradores');
  return data;
};
