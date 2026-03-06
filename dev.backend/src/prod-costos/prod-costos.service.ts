import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProdCostos } from './entities/prod-costo.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProdCostosService {
  constructor(
    @InjectRepository(ProdCostos, 'sqlserverConnection')
    private readonly prodCostosRepository: Repository<ProdCostos>,
  ) {}

  async findByCodProducto(codProducto: string): Promise<ProdCostos> {
    return this.prodCostosRepository.findOne({ where: { CodProducto: codProducto } });
  }

  async findAllPricesMap(): Promise<Map<string, number>> {
    const allCosts = await this.prodCostosRepository.find({ select: ['CodProducto', 'Precio'] });
    const map = new Map<string, number>();
    for (const c of allCosts) {
      if (c.Precio !== null && c.Precio !== undefined) {
        map.set(c.CodProducto, Number(c.Precio));
      }
    }
    return map;
  }
}
