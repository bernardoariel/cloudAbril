import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"

import type { ClienteCredito } from "@/interface/ClienteCredito"


const getClienteCredito = async(codCliente:string):Promise<ClienteCredito[]> =>{
  const { data } = await apiAbrilSql.get<ClienteCredito[]>(`/clientes-creditos/cliente/${codCliente}/con-recibo`)

  return data ?? []
}

export const useClienteCredito = (codCliente:string) =>{

    const { isLoading, data:clienteCredito ,} = useQuery<ClienteCredito[]>({
        queryKey: ['cliente-credito', codCliente],
        queryFn: ()=> getClienteCredito(codCliente), // es una funcion no una ejecucion
        enabled: !!codCliente,// opcional: evita llamar si está vacío/undefined
    })

  return{
    clienteCredito,
    isLoading
  }

}

