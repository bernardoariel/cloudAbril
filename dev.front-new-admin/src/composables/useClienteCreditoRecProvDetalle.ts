import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"

import type { ClienteCreditoRecProvDetalle } from "@/interface/ClienteCreditoRecProvDetalle"


const getClienteCreditoRecProvDetalle = async(codReciboPr:string):Promise<ClienteCreditoRecProvDetalle> =>{
  const { data } = await apiAbrilSql.get<ClienteCreditoRecProvDetalle>(`/clientes-recprov-det/${codReciboPr}`)

  return data
}

export const useClienteCreditoRecProvDetalle  = (codReciboPr?: string) =>{

    const { isLoading, data:credito , isFetching, error, refetch } = useQuery<ClienteCreditoRecProvDetalle>({
        queryKey: ['clientes-recprov-det', codReciboPr],
        queryFn: ()=> getClienteCreditoRecProvDetalle(codReciboPr as string), // es una funcion no una ejecucion
        enabled: !!codReciboPr,// opcional: evita llamar si está vacío/undefined
    })

  return{
    credito,
    isLoading,
    isFetching,
    error,
    refetch
  }

}

