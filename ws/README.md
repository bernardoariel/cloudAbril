# API de WhatsApp Cloud para Abril

## Descripción

Este proyecto consiste en una API construida con NestJS que se integra con la API de WhatsApp Cloud para enviar diferentes tipos de mensajes: texto, imágenes, videos, audios, documentos y plantillas de mensajes.

> **IMPORTANTE**: Este proyecto está configurado para un entorno de prueba y desarrollo, NO para producción. Los tokens y credenciales utilizadas son temporales y deben ser reemplazadas en un entorno de producción.

## Configuración del archivo .env

El proyecto requiere un archivo `.env` en la raíz con las siguientes variables de entorno:

```
PORT=3010
WHATSAPP_TOKEN=EACLsY2dLCPoBO3K3RrTKPakrXN4AYLm4ZBQbWxrEetCqkhdhv337hQyhl94GGosdR4ey9ZBmStpOPftUZAjIrCvrGNdwb21QB9ApbXj9twXHcVd3FK3VEdik0UalCYHIPZBFZB3uernORZBE2dZCTm1a88NkBPpc8Sgbuzh2d4QSsB3uuCETGxB5ZBZB63aAkmYGLZCQZDZD
WHATSAPP_PHONE_ID=662944993549366
```

**Notas importantes sobre las variables de entorno:**

- El token de WhatsApp (`WHATSAPP_TOKEN`) es temporal y solo válido para pruebas. Para un entorno de producción, debes generar un token permanente desde Meta Business Suite.
  
- El ID del número de teléfono (`WHATSAPP_PHONE_ID`) corresponde al número de prueba. En producción, deberás usar el ID asociado a tu número de WhatsApp Business verificado.

- Si cambias el puerto (`PORT`), recuerda actualizar también la configuración en tu cliente o en el Dockerfile si estás usando contenedores.

## Endpoints disponibles

La API proporciona los siguientes endpoints para enviar mensajes:

### Mensajes de texto
```
POST /whatsapp/text
```
```json
{
  "to": "549XXXXXXXXXX",
  "message": "Hola! Este es un mensaje de prueba"
}
```

### Mensajes con imágenes
```
POST /whatsapp/image
```
```json
{
  "to": "549XXXXXXXXXX",
  "link": "https://ejemplo.com/imagen.jpg"
}
```

### Mensajes con videos
```
POST /whatsapp/video
```
```json
{
  "to": "549XXXXXXXXXX",
  "link": "https://ejemplo.com/video.mp4"
}
```

### Mensajes con audio
```
POST /whatsapp/audio
```
```json
{
  "to": "549XXXXXXXXXX",
  "link": "https://ejemplo.com/audio.mp3"
}
```

### Mensajes con documentos
```
POST /whatsapp/document
```
```json
{
  "to": "549XXXXXXXXXX",
  "link": "https://ejemplo.com/documento.pdf",
  "filename": "documento.pdf"
}
```

### Mensajes con plantillas
```
POST /whatsapp/template
```
```json
{
  "to": "549XXXXXXXXXX",
  "template": {
    "name": "nombre_plantilla",
    "language": {
      "code": "es"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          {
            "type": "text",
            "parameter_name": "1",
            "text": "Valor del parámetro"
          }
        ]
      }
    ]
  }
}
```

## Plantillas específicas

La API también incluye endpoints para plantillas específicas:

### Aviso de compra
```
POST /whatsapp/template/aviso_compra
```

### Aviso de pago
```
POST /whatsapp/template/aviso_pago
```

## Configuración del proyecto

```bash
# instalación de dependencias
$ npm install
```

## Ejecución del proyecto

```bash
# modo desarrollo
$ npm run start

# modo observación (recomendado para desarrollo)
$ npm run start:dev

# modo producción
$ npm run start:prod
```

## Docker

El proyecto incluye un Dockerfile para crear una imagen Docker. Para construirla y ejecutarla:

```bash
# Construir la imagen
$ docker build -t abril-whatsapp-api .

# Ejecutar el contenedor
$ docker run -p 3010:3010 --env-file .env abril-whatsapp-api
```

## Próximos pasos

En futuras actualizaciones se implementarán:

- Autenticación y autorización con JWT
- Integración con sistemas de base de datos
- Webhooks para recepción de mensajes
- Más plantillas predefinidas

## Notas de desarrollo

Este proyecto utiliza NestJS v11 con TypeScript y ha sido configurado para un entorno de desarrollo. Para la implementación en producción, se recomienda:

1. Generar tokens permanentes para la API de WhatsApp
2. Implementar mecanismos de autenticación
3. Configurar HTTPS con certificados válidos
4. Implementar un sistema de registro (logging) más robusto
5. Configurar variables de entorno seguras en el servidor de producción

---

**Recordatorio**: Este es un proyecto de prueba y no debe utilizarse en un entorno de producción sin las modificaciones apropiadas.
