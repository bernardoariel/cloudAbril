import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    constructor(private readonly logger: LoggerService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const { method, originalUrl, ip, body } = req;
        const userAgent = req.get('user-agent') || '';

        // Registrar solicitud entrante
        this.logger.logInfo(
            `Solicitud recibida - ${method} ${originalUrl} - IP: ${ip} - UA: ${userAgent}`,
            'HttpMiddleware'
        );

        // Registrar el cuerpo de la solicitud (sin información sensible)
        if (body && Object.keys(body).length > 0) {
            // Aquí podríamos sanitizar el body si contiene información sensible
            const sanitizedBody = this.sanitizeBody(body);
            this.logger.logInfo(
                `Cuerpo de solicitud: ${JSON.stringify(sanitizedBody)}`,
                'HttpMiddleware'
            );
        }

        // Capturar tiempo de inicio para medir duración
        const startTime = Date.now();

        // Interceptar la finalización de la respuesta
        res.on('finish', () => {
            const { statusCode } = res;
            const contentLength = res.get('content-length') || 0;
            const duration = Date.now() - startTime;

            // Registrar respuesta
            if (statusCode >= 400) {
                this.logger.logError(
                    `Respuesta con error - ${method} ${originalUrl} - Código: ${statusCode} - Duración: ${duration}ms - Tamaño: ${contentLength}`,
                    new Error(`HTTP Status ${statusCode}`),
                    'HttpMiddleware'
                );
            } else {
                this.logger.logInfo(
                    `Respuesta exitosa - ${method} ${originalUrl} - Código: ${statusCode} - Duración: ${duration}ms - Tamaño: ${contentLength}`,
                    'HttpMiddleware'
                );
            }
        });

        next();
    }

    // Método para sanitizar información sensible del cuerpo de la solicitud
    private sanitizeBody(body: any): any {
        if (!body) return {};

        const sanitized = { ...body };

        // Ocultar tokens o información sensible si existe
        if (sanitized.token) sanitized.token = '[REDACTED]';
        if (sanitized.password) sanitized.password = '[REDACTED]';
        if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';

        return sanitized;
    }
}
