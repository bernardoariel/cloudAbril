import { apiAbrilSql } from "@/api/apiAbrilSql"
import { useQuery } from "@tanstack/vue-query"
import type { Cliente } from "@/interface/Cliente"


const getCliente = async(codCliente:string):Promise<Cliente> =>{
  const { data } = await apiAbrilSql.get<Cliente>(`/clientes/${codCliente}`)

  return data
}

export const useCliente = (codCliente:string) =>{

    const { isLoading, data:cliente ,} = useQuery<Cliente>({
        queryKey: ['cliente', codCliente],
        queryFn: ()=> getCliente(codCliente), // es una funcion no una ejecucion
        enabled: !!codCliente,// opcional: evita llamar si está vacío/undefined
    })

  return{
    cliente,
    isLoading
  }

}

