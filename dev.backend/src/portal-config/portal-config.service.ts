import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PortalPaletteDto } from './portal-config.dto';

const PALETTE_FILE = path.join(process.cwd(), 'portal-palette.json');

const FALLBACK: PortalPaletteDto = {
  dark:               '#7B2D8E',
  primary:            '#9B30FF',
  light:              '#C850C0',
  cta:                '#EF7E00',
  showOnlyWithImages: false,
  navbarLogoColor:    'white',
  navbarLinkColor:    'white',
  navbarButtonColor:  'white',
  footerLogoColor:    'white',
  heroTitle:          'Encontrá lo que buscás',
  heroSubtitle:       'Los mejores productos, las mejores opciones de pago',
  heroTitleColor:     'white',
  heroSubtitleColor:  'white',
  footerCompany:      'Abril Amoblamientos',
  footerTagline:      'abril vive en vos',
  footerWebsite:      'abrilamoblamientos.com.ar',
  footerCompanyColor: 'white',
  footerTaglineColor: 'white',
  footerWebsiteColor: 'white',
};

@Injectable()
export class PortalConfigService {
  private readonly logger = new Logger(PortalConfigService.name);

  getPalette(): PortalPaletteDto {
    try {
      if (fs.existsSync(PALETTE_FILE)) {
        const content = fs.readFileSync(PALETTE_FILE, 'utf8');
        // Merge con FALLBACK para garantizar campos nuevos en paletas antiguas.
        // Solo se retornan claves conocidas para evitar que campos viejos contaminen el DTO.
        const raw = { ...FALLBACK, ...JSON.parse(content) };
        return {
          dark:               raw.dark,
          primary:            raw.primary,
          light:              raw.light,
          cta:                raw.cta,
          showOnlyWithImages: raw.showOnlyWithImages,
          navbarLogoColor:    raw.navbarLogoColor,
          navbarLinkColor:    raw.navbarLinkColor,
          navbarButtonColor:  raw.navbarButtonColor,
          footerLogoColor:    raw.footerLogoColor,
          heroTitle:          raw.heroTitle,
          heroSubtitle:       raw.heroSubtitle,
          heroTitleColor:     raw.heroTitleColor,
          heroSubtitleColor:  raw.heroSubtitleColor,
          footerCompany:      raw.footerCompany,
          footerTagline:      raw.footerTagline,
          footerWebsite:      raw.footerWebsite,
          footerCompanyColor: raw.footerCompanyColor,
          footerTaglineColor: raw.footerTaglineColor,
          footerWebsiteColor: raw.footerWebsiteColor,
        };
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

      const currentPalette = this.getPalette();
      const colors: PortalPaletteDto = {
        ...currentPalette,   // preserva showOnlyWithImages, navbarLogoColor, footerLogoColor
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
