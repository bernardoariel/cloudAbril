import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard que permite acceso si se presenta:
 *  - Header  x-portal-key: <PORTAL_CONFIG_KEY>   (para n8n / automatización)
 *  - Header  Authorization: Bearer <JWT>          (para admins desde el panel)
 */
@Injectable()
export class PortalKeyOrJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();

    // ── opción 1: API Key para n8n ──────────────────────────────────────────
    const portalKey = req.headers['x-portal-key'] as string;
    const expectedKey = process.env.PORTAL_CONFIG_KEY;
    if (expectedKey && portalKey === expectedKey) {
      return true;
    }

    // ── opción 2: JWT de admin ──────────────────────────────────────────────
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = this.jwtService.verify(token);
        req.user = decoded;
        return true;
      } catch {
        // inválido o expirado — cae al error de abajo
      }
    }

    throw new HttpException(
      { message: 'Se requiere x-portal-key o JWT válido', statusCode: HttpStatus.UNAUTHORIZED },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
