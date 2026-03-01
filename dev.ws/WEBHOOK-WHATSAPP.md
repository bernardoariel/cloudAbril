# Webhook de WhatsApp - Configuración y Uso

## Descripción

Este sistema permite recibir y almacenar mensajes entrantes de WhatsApp a través de webhooks de la API de WhatsApp Business.

## Tablas de Base de Datos

Se han creado dos nuevas tablas con prefijo `ws-`:

### 1. `ws_incoming_messages`
Almacena los mensajes entrantes recibidos de WhatsApp.

**Campos principales:**
- `whatsapp_message_id`: ID único del mensaje de WhatsApp
- `phone_from`: Teléfono del remitente
- `contact_name`: Nombre del contacto
- `message_type`: Tipo de mensaje (text, image, audio, video, document, location, contacts, unknown)
- `message_text`: Contenido de texto del mensaje
- `media_id`: ID del archivo multimedia (si aplica)
- `timestamp`: Marca de tiempo del mensaje
- `status`: Estado del procesamiento (received, processed, failed)
- `raw_payload`: Payload completo del webhook en JSON

### 2. `ws_webhook_events`
Almacena eventos del webhook como cambios de estado de mensajes enviados.

**Campos principales:**
- `event_type`: Tipo de evento (message, message_status, other)
- `whatsapp_message_id`: ID del mensaje relacionado
- `message_status`: Estado del mensaje (sent, delivered, read, failed, deleted)
- `timestamp`: Marca de tiempo del evento
- `raw_payload`: Payload completo del webhook en JSON

## Configuración

### 1. Variables de Entorno

#### En `dev.ws/.env`:
```env
WHATSAPP_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_ID=tu_phone_number_id
WHATSAPP_API_VERSION=v22.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_abril_2024
```

#### En `dev.backend/.env`:
```env
WS_SERVICE_URL=http://localhost:3002
```

### 2. Configurar el Webhook en Meta (Facebook)

1. Ve a https://developers.facebook.com
2. Selecciona tu aplicación de WhatsApp Business
3. Ve a "WhatsApp" > "Configuración"
4. En "Webhooks", haz clic en "Configurar"
5. URL del webhook: `https://tu-dominio.com/whatsapp/webhook`
6. Token de verificación: `mi_token_secreto_abril_2024` (o el que hayas configurado)
7. Suscríbete a los eventos:
   - `messages` (mensajes entrantes)
   - `message_status` (cambios de estado)

## Endpoints del Servicio WS

### Webhook (GET) - Verificación
```
GET /whatsapp/webhook
```
Endpoint para que Meta verifique tu webhook.

### Webhook (POST) - Recibir Eventos
```
POST /whatsapp/webhook
```
Endpoint que recibe los eventos de WhatsApp.

### Consultar Mensajes Entrantes
```
GET /whatsapp/incoming-messages?page=1&limit=50
```
Devuelve los mensajes entrantes con paginación.

**Respuesta:**
```json
{
  "data": [...],
  "total": 100
}
```

### Consultar Mensajes por Teléfono
```
GET /whatsapp/incoming-messages/by-phone?phone=5491112345678
```
Devuelve todos los mensajes de un teléfono específico.

### Consultar Eventos del Webhook
```
GET /whatsapp/webhook-events?page=1&limit=50
```
Devuelve los eventos del webhook con paginación.

## Endpoints del Backend (para el Frontend)

Todos estos endpoints requieren autenticación JWT.

### Consultar Mensajes Entrantes
```
GET /ws-webhook/incoming-messages?page=1&limit=50
```

### Consultar Mensajes por Teléfono
```
GET /ws-webhook/incoming-messages/by-phone?phone=5491112345678
```

### Consultar Eventos del Webhook
```
GET /ws-webhook/webhook-events?page=1&limit=50
```

### Estadísticas
```
GET /ws-webhook/stats
```

**Respuesta:**
```json
{
  "totalMessages": 150,
  "totalEvents": 300,
  "uniquePhones": 45,
  "messageTypes": {
    "text": 120,
    "image": 20,
    "audio": 10
  },
  "lastUpdate": "2026-02-05T10:30:00Z"
}
```

## Tipos de Mensajes Soportados

- **text**: Mensajes de texto
- **image**: Imágenes
- **audio**: Notas de voz
- **video**: Videos
- **document**: Documentos (PDF, Word, etc)
- **location**: Ubicaciones
- **contacts**: Contactos compartidos

## Estructura del Webhook de WhatsApp

### Mensaje Entrante
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "contacts": [{
          "profile": {
            "name": "Juan Pérez"
          },
          "wa_id": "5491112345678"
        }],
        "messages": [{
          "from": "5491112345678",
          "id": "wamid.ABC123...",
          "timestamp": "1675612345",
          "type": "text",
          "text": {
            "body": "Hola, quiero consultar por un producto"
          }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

### Cambio de Estado
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "15551234567",
          "phone_number_id": "PHONE_NUMBER_ID"
        },
        "statuses": [{
          "id": "wamid.ABC123...",
          "recipient_id": "5491112345678",
          "status": "delivered",
          "timestamp": "1675612350"
        }]
      },
      "field": "messages"
    }]
  }]
}
```

## Testing Local

Para probar el webhook localmente, puedes usar **ngrok**:

```bash
# Instalar ngrok
npm install -g ngrok

# Exponer el puerto del servicio ws
ngrok http 3002

# Usar la URL de ngrok en la configuración de Meta
# Ejemplo: https://abc123.ngrok.io/whatsapp/webhook
```

## Logs

El sistema registra todos los eventos en la consola:
- Verificación del webhook
- Mensajes recibidos
- Eventos procesados
- Errores

Revisa los logs del servicio `dev.ws` para depurar problemas.

## Próximos Pasos

1. **Frontend**: Crear vistas para mostrar los mensajes recibidos
2. **Respuestas automáticas**: Implementar lógica para responder mensajes automáticamente
3. **Integración con CRM**: Asociar mensajes con clientes existentes
4. **Notificaciones**: Notificar al equipo cuando lleguen mensajes nuevos
