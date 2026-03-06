import { IsHexColor, IsUrl } from 'class-validator';

export class PortalPaletteDto {
  @IsHexColor()
  dark: string;

  @IsHexColor()
  primary: string;

  @IsHexColor()
  light: string;

  @IsHexColor()
  cta: string;
}

export class ExtractPaletteDto {
  @IsUrl()
  imageUrl: string;
}
