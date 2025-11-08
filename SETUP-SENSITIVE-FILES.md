# Configuración de Archivos Sensibles

Este repositorio no incluye archivos sensibles por seguridad. Después de clonar el repositorio, necesitas crear los siguientes archivos:

## Archivos de Configuración de Firebase

### `dev.backend/firebase-config.ts`
```typescript
export const firebaseConfig = {
  apiKey: "tu-api-key",
  authDomain: "tu-auth-domain",
  projectId: "tu-project-id",
  storageBucket: "tu-storage-bucket",
  messagingSenderId: "tu-messaging-sender-id",
  appId: "tu-app-id"
};
```

### `dev.backend/firebase-admin.config.ts`
```typescript
export const firebaseAdminConfig = {
  type: "service_account",
  project_id: "tu-project-id",
  private_key_id: "tu-private-key-id",
  private_key: "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-xxx@tu-project.iam.gserviceaccount.com",
  client_id: "tu-client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxx%40tu-project.iam.gserviceaccount.com"
};
```

## Variables de Entorno

### `.env` (en el directorio raíz)
```bash
# Database
DATABASE_URL=tu-database-url
DATABASE_PASSWORD=tu-database-password

# JWT
JWT_SECRET=tu-jwt-secret

# Email
EMAIL_USER=tu-email
EMAIL_PASSWORD=tu-password

# APIs externas
EXTERNAL_API_KEY=tu-api-key
```

## Certificados SSL

Los certificados SSL deben ubicarse en `nginx/acme.sh/` y son generados automáticamente por acme.sh. 

Para regenerarlos:
1. Configura acme.sh en el servidor
2. Ejecuta los scripts de generación de certificados
3. Los archivos se crearán automáticamente en las rutas correspondientes

## Notas de Seguridad

- NUNCA commits estos archivos al repositorio
- Usa variables de entorno en producción
- Mantén copias de seguridad seguras de las configuraciones
- Rota las claves periódicamente