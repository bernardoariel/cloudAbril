import { IsBoolean, IsHexColor, IsString, IsUrl } from 'class-validator';

export class PortalPaletteDto {
  @IsHexColor()
  dark: string;

  @IsHexColor()
  primary: string;

  @IsHexColor()
  light: string;

  @IsHexColor()
  cta: string;

  @IsBoolean()
  showOnlyWithImages: boolean;

  /** 'white' | 'original' | '#RRGGBB' */
  @IsString()
  navbarLogoColor: string;

  /** 'white' | 'original' | '#RRGGBB' */
  @IsString()
  footerLogoColor: string;

  @IsString()
  heroTitle: string;

  @IsString()
  heroSubtitle: string;

  @IsString()
  footerCompany: string;

  @IsString()
  footerTagline: string;

  @IsString()
  footerWebsite: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  navbarLinkColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  navbarButtonColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  heroTitleColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  heroSubtitleColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  footerCompanyColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  footerTaglineColor: string;

  /** '#RRGGBB' | 'white' */
  @IsString()
  footerWebsiteColor: string;
}

export class ExtractPaletteDto {
  @IsUrl()
  imageUrl: string;
}
