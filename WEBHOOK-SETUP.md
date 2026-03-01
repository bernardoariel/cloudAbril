# 🚀 Configuración Rápida - Webhook WhatsApp

## 📋 Resumen de Archivos Creados

### Servicio WS (dev.ws)
```
src/whatsapp/
├── entities/
│   ├── ws-incoming-message.entity.ts  ✅ Nueva tabla para mensajes entrantes
│   └── ws-webhook-event.entity.ts     ✅ Nueva tabla para eventos
├── dto/
│   └── webhook.dto.ts                 ✅ DTOs para validación
├── whatsapp.controller.ts             ✏️ Modificado - agregados endpoints webhook
├── whatsapp.service.ts                ✏️ Sin cambios
├── whatsapp.module.ts                 ✏️ Modificado - agregadas entidades
└── webhook.service.ts                 ✅ Nuevo - lógica de procesamiento
```

### Backend (dev.backend)
```
src/whatsapp-history/
├── ws-webhook.controller.ts           ✅ Nuevo - endpoints para frontend
├── ws-webhook.service.ts              ✅ Nuevo - proxy al servicio ws
└── whatsapp-history.module.ts         ✏️ Modificado - agregados controlador y servicio
```

### Frontend (dev.front-admin)
```
src/
├── api/
│   └── wsWebhookApi.ts                ✅ Nuevo - cliente API
└── views/
    └── WsWebhookMessages.vue          ✅ Nueva vista para mostrar mensajes
```

## ⚙️ Pasos de Configuración

### 1. Variables de Entorno

**dev.ws/.env**
```env
# Token de WhatsApp Business API
WHATSAPP_TOKEN=tu_token_aqui

# ID del número de teléfono
WHATSAPP_PHONE_ID=tu_phone_id_aqui

# Versión de la API
WHATSAPP_API_VERSION=v22.0

# Token de verificación del webhook (define uno secreto)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_abril_2024
```

**dev.backend/.env**
```env
# URL del servicio WS (ajustar según tu configuración)
WS_SERVICE_URL=http://localhost:3002
```

### 2. Crear las Tablas en la Base de Datos

Las entidades TypeORM se crearán automáticamente si tienes `synchronize: true`. Si no, ejecuta las migraciones o crea manualmente:

```sql
-- Tabla de mensajes entrantes
CREATE TABLE ws_incoming_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_message_id VARCHAR(255) UNIQUE NOT NULL,
  phone_from VARCHAR(30) NOT NULL,
  contact_name VARCHAR(255),
  message_type VARCHAR(20) NOT NULL,
  message_text TEXT,
  media_url TEXT,
  media_id VARCHAR(255),
  media_mime_type VARCHAR(100),
  timestamp BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'received',
  raw_payload TEXT NOT NULL,
  processing_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ws_incoming_phone ON ws_incoming_messages(phone_from);
CREATE INDEX idx_ws_incoming_created ON ws_incoming_messages(created_at);

-- Tabla de eventos del webhook
CREATE TABLE ws_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  whatsapp_message_id VARCHAR(255),
  phone_number VARCHAR(30),
  message_status VARCHAR(20),
  timestamp BIGINT,
  raw_payload TEXT NOT NULL,
  error_details TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ws_events_type ON ws_webhook_events(event_type);
CREATE INDEX idx_ws_events_msg_id ON ws_webhook_events(whatsapp_message_id);
CREATE INDEX idx_ws_events_created ON ws_webhook_events(created_at);
```

### 3. Configurar el Webhook en Meta

1. **Ir a Meta for Developers**: https://developers.facebook.com
2. **Seleccionar tu app** de WhatsApp Business
3. **Configurar Webhook**:
   - URL: `https://tu-dominio.com/whatsapp/webhook`
   - Token: `mi_token_secreto_abril_2024` (el mismo de tu .env)
4. **Suscribirse a eventos**:
   - ✅ messages
   - ✅ message_status

### 4. Testing Local con ngrok

Para probar localmente antes de deploy:

```bash
# Instalar ngrok (si no lo tienes)
npm install -g ngrok

# Exponer el puerto del servicio ws (por defecto 3002)
ngrok http 3002

# Copiar la URL https de ngrok y configurarla en Meta
# Ejemplo: https://abc123.ngrok.io/whatsapp/webhook
```

### 5. Agregar la Ruta en el Frontend

En tu archivo de rutas de Vue Router (router/index.ts):

```typescript
{
  path: '/ws-webhook/messages',
  name: 'WsWebhookMessages',
  component: () => import('@/views/WsWebhookMessages.vue'),
  meta: { requiresAuth: true }
}
```

### 6. Agregar el Menú en el Frontend

En tu componente de navegación:

```vue
<RouterLink to="/ws-webhook/messages">
  📱 Mensajes WhatsApp
</RouterLink>
```

## 🧪 Probar el Webhook

### Verificación (GET)
```bash
curl "http://localhost:3002/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=mi_token_secreto_abril_2024&hub.challenge=TEST123"
# Debería devolver: TEST123
```

### Simular Mensaje Entrante (POST)
```bash
curl -X POST http://localhost:3002/whatsapp/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "123456"
          },
          "contacts": [{
            "profile": { "name": "Juan Pérez" },
            "wa_id": "5491112345678"
          }],
          "messages": [{
            "from": "5491112345678",
            "id": "wamid.TEST123",
            "timestamp": "1675612345",
            "type": "text",
            "text": { "body": "Hola, esto es una prueba" }
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

### Consultar Mensajes
```bash
# Desde el servicio ws
curl http://localhost:3002/whatsapp/incoming-messages

# Desde el backend (requiere token JWT)
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:3001/ws-webhook/incoming-messages
```

## 📊 Endpoints Disponibles

### Servicio WS (puerto 3002)
- `GET /whatsapp/webhook` - Verificación del webhook
- `POST /whatsapp/webhook` - Recibir eventos de WhatsApp
- `GET /whatsapp/incoming-messages` - Lista de mensajes entrantes
- `GET /whatsapp/incoming-messages/by-phone?phone=...` - Mensajes por teléfono
- `GET /whatsapp/webhook-events` - Lista de eventos

### Backend (puerto 3001) - Requieren autenticación
- `GET /ws-webhook/incoming-messages` - Lista de mensajes
- `GET /ws-webhook/incoming-messages/by-phone?phone=...` - Mensajes por teléfono
- `GET /ws-webhook/webhook-events` - Lista de eventos
- `GET /ws-webhook/stats` - Estadísticas

## 🔍 Verificar que Funciona

1. **Envía un mensaje** a tu número de WhatsApp Business desde otro teléfono
2. **Revisa los logs** del servicio ws - deberías ver:
   ```
   [WebhookService] Received webhook event
   [WebhookService] Saved incoming message wamid.ABC123... from 5491112345678
   ```
3. **Consulta la API**:
   ```bash
   curl http://localhost:3002/whatsapp/incoming-messages
   ```
4. **Abre el frontend** en `/ws-webhook/messages` y verás el mensaje

## 🐛 Troubleshooting

### El webhook no recibe eventos
- ✅ Verifica que la URL en Meta sea correcta y accesible
- ✅ Revisa que el token de verificación coincida
- ✅ Chequea los logs del servicio ws
- ✅ Usa ngrok para testing local

### Error de base de datos
- ✅ Verifica que las tablas existan
- ✅ Revisa la conexión a la BD en dev.ws
- ✅ Comprueba que TypeORM esté configurado correctamente

### El frontend no muestra mensajes
- ✅ Verifica que WS_SERVICE_URL esté configurado en dev.backend
- ✅ Comprueba que el token JWT sea válido
- ✅ Revisa la consola del navegador para errores

## 📚 Documentación Adicional

Ver [WEBHOOK-WHATSAPP.md](./WEBHOOK-WHATSAPP.md) para más detalles.
