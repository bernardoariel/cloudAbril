import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesMetPagosService } from './clientes-metpagos.service';
import { ClientesMetPagosController } from './clientes-metpagos.controller';
import { ClienteMetPago } from './entities/cliente-metpago.entity';
import { ClienteCredito } from '../clientes-creditos/entities/cliente-credito.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteMetPago, ClienteCredito], 'sqlserverConnection')],
  controllers: [ClientesMetPagosController],
  providers: [ClientesMetPagosService],
})
export class ClientesMetPagosModule {} 