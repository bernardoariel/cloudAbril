import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { LoggerService } from '../utils/logger.service';

@Injectable()
export class WhatsappService {
    private apiUrl: string;
    private headers: any;

    constructor(private readonly logger: LoggerService) {
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        const token = process.env.WHATSAPP_TOKEN;
        if (!phoneId) throw new Error('WHATSAPP_PHONE_ID no configurado');
        if (!token) throw new Error('WHATSAPP_TOKEN no configurado');
        if (!token) {
            this.logger.logError('WHATSAPP_TOKEN no está configurado en las variables de entorno',
                new Error('Token de WhatsApp no configurado'), 'WhatsappService');
        }

        this.apiUrl = `https://graph.facebook.com/v22.0/${phoneId}/messages`;
        this.headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
    }

    async sendTextMessage(to: string, message: string) {
        try {
            this.logger.logInfo(`Enviando mensaje de texto a ${to}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: {
                    body: message,
                },
            }
            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Mensaje de texto enviado exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar mensaje de texto a ${to}`, error, 'WhatsappService');
            throw error;
        }
    }
    async sendImageMessage(to: string, link: string) {
        try {
            this.logger.logInfo(`Enviando imagen a ${to} desde ${link}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'image',
                image: {
                    link,
                },
            };
            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Imagen enviada exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar imagen a ${to} desde ${link}`, error, 'WhatsappService');
            throw error;
        }
    }

    async sendVideoMessage(to: string, link: string) {
        try {
            this.logger.logInfo(`Enviando video a ${to} desde ${link}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'video',
                video: {
                    link,
                },
            };
            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Video enviado exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar video a ${to} desde ${link}`, error, 'WhatsappService');
            throw error;
        }
    }


    async sendAudioMessage(to: string, link: string) {
        try {
            this.logger.logInfo(`Enviando audio a ${to} desde ${link}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'audio',
                audio: {
                    link,
                },
            };
            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Audio enviado exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar audio a ${to} desde ${link}`, error, 'WhatsappService');
            throw error;
        }
    }
    async sendDocumentMessage(to: string, link: string, filename?: string) {
        try {
            this.logger.logInfo(`Enviando documento a ${to} desde ${link}${filename ? ' con nombre ' + filename : ''}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'document',
                document: {
                    link,
                    ...(filename ? { filename } : {}),
                },
            };
            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Documento enviado exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar documento a ${to} desde ${link}`, error, 'WhatsappService');
            throw error;
        }
    }

    async sendTemplateMessage(to: string, templateName: string, languageCode: string, components: any[]) {
        try {
            this.logger.logInfo(`Enviando plantilla "${templateName}" a ${to} en idioma ${languageCode}`, 'WhatsappService');

            const data = {
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: languageCode,
                    },
                    components,
                },
            };

            const response = await axios.post(this.apiUrl, data, { headers: this.headers });

            this.logger.logInfo(`Plantilla "${templateName}" enviada exitosamente a ${to}`, 'WhatsappService');
            return response.data;
        } catch (error) {
            this.logger.logError(`Error al enviar plantilla "${templateName}" a ${to}`, error, 'WhatsappService');
            throw error;
        }
    }

}
