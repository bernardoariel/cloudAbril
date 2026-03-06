import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProdStock } from './entities/prod-stock.entity';
import { Sucursal } from '../prod-sucursal/entities/prod-sucursal.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProdStockService {
  private stockCache: { CodProducto: string; totalCantidad: number }[] = [];
  private stockBySucursalCache: { CodProducto: string; CodSucursal: string; Cantidad: number }[] = [];
  constructor(
    @InjectRepository(ProdStock,'sqlserverConnection')
    private prodStockRepository: Repository<ProdStock>,
    @InjectRepository(Sucursal,'sqlserverConnection')
    private sucursalRepository: Repository<Sucursal>,
  ) {}
  async loadStockCache(): Promise<void> {
    // Obtener códigos de sucursales de servicio técnico para excluirlos
    const servSucursales = await this.sucursalRepository
      .createQueryBuilder('suc')
      .select('suc.CodSucursal', 'CodSucursal')
      .where('suc.NombreSuc LIKE :prefix', { prefix: 'SERV%' })
      .getRawMany();
    const servCodes: string[] = servSucursales.map((s) => s.CodSucursal);

    // Stock total por producto (excluye sucursales SERV*)
    const totalQb = this.prodStockRepository
      .createQueryBuilder('prodStock')
      .select('prodStock.CodProducto', 'CodProducto')
      .addSelect('SUM(prodStock.Cantidad)', 'totalCantidad')
      .where('prodStock.Cantidad != :cantidad', { cantidad: 0 });
    if (servCodes.length > 0) {
      totalQb.andWhere('prodStock.CodSucursal NOT IN (:...servCodes)', { servCodes });
    }
    this.stockCache = await totalQb.groupBy('prodStock.CodProducto').getRawMany();

    // Stock por sucursal (excluye sucursales SERV*)
    const sucQb = this.prodStockRepository
      .createQueryBuilder('prodStock')
      .select(['prodStock.CodProducto', 'prodStock.CodSucursal', 'prodStock.Cantidad'])
      .where('prodStock.Cantidad > 0');
    if (servCodes.length > 0) {
      sucQb.andWhere('prodStock.CodSucursal NOT IN (:...servCodes)', { servCodes });
    }
    this.stockBySucursalCache = await sucQb.getMany();
  }

  getStockFromCache(codProducto: string): { CodProducto: string; totalCantidad: number } | undefined {
    return this.stockCache.find((item) => item.CodProducto === codProducto);
  }
  getAllStockFromCache(): { CodProducto: string; totalCantidad: number }[] {
    return this.stockCache;
  }

  getSucursalesFromCache(codProducto: string): { CodSucursal: string; Cantidad: number }[] {
    return this.stockBySucursalCache
      .filter(s => s.CodProducto === codProducto)
      .map(s => ({ CodSucursal: s.CodSucursal, Cantidad: s.Cantidad }));
  }


  async findByCodProductoWithStock(codProducto: string): Promise<ProdStock[]> {
    const results = await this.prodStockRepository
    .createQueryBuilder('prodStock')
    .where('prodStock.CodProducto = :codProducto', { codProducto })
    .andWhere('prodStock.Cantidad > 0')
    .getMany();
  
  
    return results;
  }
 
}
