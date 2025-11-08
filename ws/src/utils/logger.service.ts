import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService {
    private readonly logsDir = path.join(process.cwd(), 'logs');
    private readonly errorLogPath: string;
    private readonly accessLogPath: string;

    constructor() {
        // Crear directorio de logs si no existe
        if (!fs.existsSync(this.logsDir)) {
            fs.mkdirSync(this.logsDir, { recursive: true });
        }

        this.errorLogPath = path.join(this.logsDir, 'error.log');
        this.accessLogPath = path.join(this.logsDir, 'access.log');

        // Asegurarse de que los archivos de logs existan
        if (!fs.existsSync(this.errorLogPath)) {
            fs.writeFileSync(this.errorLogPath, '');
        }

        if (!fs.existsSync(this.accessLogPath)) {
            fs.writeFileSync(this.accessLogPath, '');
        }
    }

    /**
     * Registra un mensaje de error en el archivo error.log
     * @param message Mensaje descriptivo del error
     * @param error Objeto de error completo
     * @param context Contexto del error (nombre de clase o servicio)
     */
    logError(message: string, error: any, context?: string): void {
        const timestamp = new Date().toISOString();
        const logContext = context || 'Application';
        let errorDetails = '';

        // Formato detallado del error
        try {
            if (error) {
                // Información básica del error
                errorDetails += `\nError: ${error.message || 'No message'}`;
                errorDetails += `\nStack: ${error.stack || 'No stack trace'}`;

                // Si es un error de Axios, registra detalles de la respuesta
                if (error.isAxiosError) {
                    errorDetails += `\nAxios Error:`;
                    errorDetails += `\n  Status: ${error.response?.status || 'No status'}`;
                    errorDetails += `\n  Status Text: ${error.response?.statusText || 'No status text'}`;

                    // Detalles de la respuesta de error de API (como WhatsApp API)
                    if (error.response?.data) {
                        errorDetails += `\n  Response Data: ${JSON.stringify(error.response.data, null, 2)}`;
                    }

                    // Detalles de la petición
                    if (error.config) {
                        errorDetails += `\n  Request URL: ${error.config.url}`;
                        errorDetails += `\n  Request Method: ${error.config.method?.toUpperCase()}`;
                        errorDetails += `\n  Request Headers: ${JSON.stringify(this.sanitizeHeaders(error.config.headers), null, 2)}`;
                        errorDetails += `\n  Request Data: ${JSON.stringify(error.config.data, null, 2)}`;
                    }
                }
            }
        } catch (e) {
            errorDetails += `\nError al formatear detalles del error: ${e.message}`;
        }

        // Construir entrada de log
        const logEntry = `[${timestamp}] [ERROR] [${logContext}] ${message}${errorDetails}\n\n`;

        // Escribir en archivo
        fs.appendFile(this.errorLogPath, logEntry, (err) => {
            if (err) {
                console.error('Error escribiendo en archivo de log:', err);
            }
        });

        // También mostramos en consola para desarrollo
        console.error(`[${timestamp}] [ERROR] [${logContext}] ${message}`);
    }

    /**
     * Registra un mensaje informativo en el archivo access.log
     * @param message Mensaje a registrar
     * @param context Contexto del mensaje
     */
    logInfo(message: string, context?: string): void {
        const timestamp = new Date().toISOString();
        const logContext = context || 'Application';

        // Construir entrada de log
        const logEntry = `[${timestamp}] [INFO] [${logContext}] ${message}\n`;

        // Escribir en archivo
        fs.appendFile(this.accessLogPath, logEntry, (err) => {
            if (err) {
                console.error('Error escribiendo en archivo de log:', err);
            }
        });

        // También mostramos en consola para desarrollo
        console.log(`[${timestamp}] [INFO] [${logContext}] ${message}`);
    }

    /**
     * Elimina información sensible de las cabeceras antes de registrarlas
     * @param headers Cabeceras HTTP
     * @returns Cabeceras sanitizadas
     */
    private sanitizeHeaders(headers: any): any {
        if (!headers) return {};

        const sanitized = { ...headers };

        // Sanitizar token de autorización
        if (sanitized.Authorization) {
            sanitized.Authorization = 'Bearer [REDACTED]';
        }

        return sanitized;
    }
}
