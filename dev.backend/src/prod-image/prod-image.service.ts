import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProdImage } from './entities/prod-image.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ProdImageService {
  constructor(
    @InjectRepository(ProdImage,'sqlserverConnection')
    private prodImagenesRepository: Repository<ProdImage>,
  ) {}
  async findByCodProducto(codProducto: string): Promise<ProdImage | undefined> {
    return this.prodImagenesRepository.findOne({ where: { CodProducto: codProducto } });
  }

  async findAllImagesMap(): Promise<Map<string, string>> {
    const allImages = await this.prodImagenesRepository.find({ select: ['CodProducto', 'URL'] });
    const map = new Map<string, string>();
    for (const img of allImages) {
      if (img.URL) {
        map.set(img.CodProducto, img.URL.replace('10.10.0.12', 'abril.arielbernardo.com/public_image'));
      }
    }
    return map;
  }
}
