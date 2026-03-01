# 📦 Instalación de Dependencias - Webhook WhatsApp

## Servicio WS (dev.ws)

El servicio WS necesita TypeORM para manejar las nuevas tablas de mensajes.

```bash
cd dev.ws
npm install @nestjs/typeorm typeorm pg
```

### Paquetes instalados:
- `@nestjs/typeorm` - Integración de TypeORM con NestJS
- `typeorm` - ORM para TypeScript
- `pg` - Driver de PostgreSQL (o usa `mysql2` si usas MySQL)

## Backend (dev.backend)

El backend ya tiene las dependencias necesarias (HttpModule de @nestjs/axios).

```bash
cd dev.backend
# Verificar que tienes @nestjs/axios instalado
npm install @nestjs/axios
```

## Frontend (dev.front-admin)

El frontend ya debería tener axios instalado.

```bash
cd dev.front-admin
# Verificar que tienes axios instalado
npm install axios
```

## Configuración de TypeORM en dev.ws

Después de instalar las dependencias, necesitas configurar TypeORM en tu `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // o 'mysql' según tu BD
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'postgres'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_NAME', 'whatsapp_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production', // Solo en desarrollo
        logging: true,
      }),
    }),
    WhatsAppModule,
  ],
})
export class AppModule {}
```

## Variables de Entorno para dev.ws

Agrega estas variables a tu archivo `.env` en dev.ws:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=whatsapp_db

# WhatsApp API
WHATSAPP_TOKEN=tu_token_de_whatsapp
WHATSAPP_PHONE_ID=tu_phone_id
WHATSAPP_API_VERSION=v22.0
WHATSAPP_WEBHOOK_VERIFY_TOKEN=mi_token_secreto_abril_2024

# Servidor
PORT=3002
NODE_ENV=development
```

## Verificar Instalación

Después de instalar las dependencias, ejecuta:

```bash
# En dev.ws
npm run start:dev

# Deberías ver en los logs:
# - Conexión a la base de datos exitosa
# - Creación de las tablas ws_incoming_messages y ws_webhook_events
# - Servidor escuchando en el puerto 3002
```

## Probar el Webhook

Una vez que el servicio esté corriendo:

```bash
# Ejecutar los tests
cd dev.ws
node test-webhook.js

# O usar npm si agregas el script
npm run test:webhook
```

## Script de Test (opcional)

Puedes agregar este script a tu `package.json` en dev.ws:

```json
{
  "scripts": {
    "test:webhook": "node test-webhook.js"
  }
}
```

## Troubleshooting

### Error: Cannot find module 'typeorm'
```bash
cd dev.ws
npm install @nestjs/typeorm typeorm pg
```

### Error de conexión a base de datos
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en el archivo `.env`
- Verifica que la base de datos exista

### Las tablas no se crean automáticamente
Si `synchronize: true` no funciona, crea las tablas manualmente usando el SQL del archivo `WEBHOOK-SETUP.md`

### El webhook no recibe eventos
- Verifica que el servicio esté corriendo en el puerto correcto
- Usa ngrok para exponer el puerto local
- Verifica que la URL en Meta sea correcta
- Revisa los logs del servicio para ver errores
