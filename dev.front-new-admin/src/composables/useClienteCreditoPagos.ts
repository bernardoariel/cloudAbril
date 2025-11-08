import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"

import type { ClienteCreditoPagos } from "@/interface/ClienteCreditoPagos"


const getClienteCreditoPagos = async(codCredito:string):Promise<ClienteCreditoPagos> =>{
  const { data } = await apiAbrilSql.get<ClienteCreditoPagos>(`/clientes-recpdet/analisis-credito/${codCredito}`)

  return {
    ...data,
    detalle: data.detalle.map(d => ({
      ...d,
      fechaVencimiento: new Date(d.fechaVencimiento),
      detallesPago: d.detallesPago ?? {
        idPago: 0,
        montoCapitalPagado: 0,
        interesPagado: 0,
        ivaPagado: 0,
        interesPunitorioPagado: 0,
        ivaPunitorioPagado: 0,
        totalPagado: 0,
        bonificacion: 0,
      },
    })),
  }
}

export const useClienteCreditoPago  = (codCredito?: string) =>{

    const { isLoading, data:credito , isFetching, error, refetch } = useQuery<ClienteCreditoPagos>({
        queryKey: ['cliente-credito-pago', codCredito],
        queryFn: ()=> getClienteCreditoPagos(codCredito as string), // es una funcion no una ejecucion
        enabled: !!codCredito,// opcional: evita llamar si está vacío/undefined
    })

  return{
    credito,
    isLoading,
    isFetching,
    error,
    refetch
  }

}

