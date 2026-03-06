import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { PortalConfigService } from './portal-config.service';
import { ExtractPaletteDto, PortalPaletteDto } from './portal-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PortalKeyOrJwtGuard } from './portal-key-or-jwt.guard';

@Controller('portal-config')
export class PortalConfigController {
  constructor(private readonly portalConfigService: PortalConfigService) {}

  /**
   * GET /api/portal-config/palette
   * Público — cualquier visitante obtiene la paleta vigente.
   */
  @Get('palette')
  getPalette(): PortalPaletteDto {
    return this.portalConfigService.getPalette();
  }

  /**
   * PUT /api/portal-config/palette
   * Guarda una paleta custom. Requiere JWT (admin desde el panel).
   */
  @Put('palette')
  @UseGuards(JwtAuthGuard)
  savePalette(@Body() palette: PortalPaletteDto): PortalPaletteDto {
    return this.portalConfigService.savePalette(palette);
  }

  /**
   * POST /api/portal-config/extract
   * Extrae la paleta de una imagen remota con Vibrant.js y la guarda.
   * Acepta x-portal-key (para n8n) o JWT (para admin desde el panel).
   *
   * Body: { "imageUrl": "https://..." }
   *
   * Uso n8n tras subir la nueva portada:
   *   POST /api/portal-config/extract
   *   Headers: x-portal-key: TU_PORTAL_CONFIG_KEY
   *   Body:    { "imageUrl": "URL de la imagen subida" }
   */
  @Post('extract')
  @UseGuards(PortalKeyOrJwtGuard)
  async extractPalette(@Body() dto: ExtractPaletteDto): Promise<PortalPaletteDto> {
    return this.portalConfigService.extractFromUrl(dto.imageUrl);
  }

  /**
   * POST /api/portal-config/reset
   * Restaura los colores por defecto de Abril.
   * Acepta x-portal-key o JWT.
   */
  @Post('reset')
  @UseGuards(PortalKeyOrJwtGuard)
  resetPalette(): PortalPaletteDto {
    return this.portalConfigService.resetToDefault();
  }
}

