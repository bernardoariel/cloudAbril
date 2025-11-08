import { useQuery } from '@tanstack/vue-query';
import { getProductById } from '../services/actions';

interface Options {
  id: number;
}

export const useProduct = ({ id }: Options) => {
  const {
    isLoading,
    isError,
    error,
    data: producto,
    isFetching,
  } = useQuery({
    queryKey: ['producto', id],
    queryFn: () => getProductById(id),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
    retry: false,
  });
  return {
    error,
    isError,
    isFetching,
    isLoading,
    producto: producto ?? [],
  };
};
