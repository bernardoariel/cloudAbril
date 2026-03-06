import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PortalPaletteDto } from './portal-config.dto';

const PALETTE_FILE = path.join(process.cwd(), 'portal-palette.json');

const FALLBACK: PortalPaletteDto = {
  dark:    '#7B2D8E',
  primary: '#9B30FF',
  light:   '#C850C0',
  cta:     '#EF7E00',
};

@Injectable()
export class PortalConfigService {
  private readonly logger = new Logger(PortalConfigService.name);

  getPalette(): PortalPaletteDto {
    try {
      if (fs.existsSync(PALETTE_FILE)) {
        const content = fs.readFileSync(PALETTE_FILE, 'utf8');
        return JSON.parse(content) as PortalPaletteDto;
      }
    } catch (err) {
      this.logger.warn(`No se pudo leer la paleta guardada: ${err.message}`);
    }
    return { ...FALLBACK };
  }

  savePalette(palette: PortalPaletteDto): PortalPaletteDto {
    fs.writeFileSync(PALETTE_FILE, JSON.stringify(palette, null, 2), 'utf8');
    this.logger.log(`Paleta guardada: ${JSON.stringify(palette)}`);
    return palette;
  }

  resetToDefault(): PortalPaletteDto {
    return this.savePalette({ ...FALLBACK });
  }

  /**
   * Descarga la imagen desde `imageUrl`, extrae la paleta con Vibrant.js
   * y la guarda como paleta activa.
   * Llamado por n8n tras subir la nueva portada, o manualmente desde el panel.
   */
  async extractFromUrl(imageUrl: string): Promise<PortalPaletteDto> {
    try {
      // node-vibrant en entorno Node.js (CJS)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Vibrant } = require('node-vibrant/node');
      const palette = await Vibrant.from(imageUrl).getPalette();

      const colors: PortalPaletteDto = {
        dark:    palette.DarkVibrant?.hex  ?? FALLBACK.dark,
        primary: palette.Vibrant?.hex      ?? FALLBACK.primary,
        light:   palette.LightVibrant?.hex ?? FALLBACK.light,
        cta:     FALLBACK.cta,  // CTA siempre naranja Abril (identidad de marca)
      };

      this.logger.log(`Paleta extraída de ${imageUrl}: ${JSON.stringify(colors)}`);
      return this.savePalette(colors);
    } catch (err) {
      this.logger.error(`Error extrayendo paleta de ${imageUrl}: ${err.message}`);
      throw err;
    }
  }
}
