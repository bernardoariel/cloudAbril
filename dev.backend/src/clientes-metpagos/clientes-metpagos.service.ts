import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteMetPago } from './entities/cliente-metpago.entity';
import { ClienteCredito } from '../clientes-creditos/entities/cliente-credito.entity';

@Injectable()
export class ClientesMetPagosService {
  constructor(
    @InjectRepository(ClienteMetPago, 'sqlserverConnection')
    private clientesMetPagosRepository: Repository<ClienteMetPago>,
    @InjectRepository(ClienteCredito, 'sqlserverConnection')
    private clientesCreditosRepository: Repository<ClienteCredito>,
  ) {}

  async findByCodVenta(codVenta: string) {
    // Obtener métodos de pago
    const metodosPago = await this.clientesMetPagosRepository.find({
      where: { CodVenta: codVenta },
    });

    // Para cada método de pago, si es crédito personal, obtener información de cuotas
    const metodosPagoConCuotas = await Promise.all(
      metodosPago.map(async (metodo) => {
        try {
          // Buscar el crédito asociado a la venta (independientemente del CodForPago)
          const credito = await this.clientesCreditosRepository.findOne({
            where: { CodVenta: codVenta },
          });
          
          if (credito && credito.CantCuotas) {
            return {
              ...metodo,
              CantCuotas: credito.CantCuotas,
              CuotaCapital: credito.CuotaCapital,
              IntMenCuota: credito.IntMenCuota
            };
          }
        } catch (error) {
          console.error('Error al obtener información del crédito:', error);
        }
        
        return metodo;
      })
    );

    return metodosPagoConCuotas;
  }
} 