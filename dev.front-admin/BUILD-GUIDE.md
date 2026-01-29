# Guía de Build para Diferentes Entornos

## Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Desarrollo local (usa .env.development)
npm run dev:qa       # Desarrollo QA (usa .env.qa)
```

### Build para Producción
```bash
npm run build        # Build para producción (usa .env.production)
npm run build:qa     # Build para QA (usa .env.qa)
npm run build:local  # Build local (usa .env.development)
```

## Archivos de Configuración

- `.env.development` - Variables para desarrollo local (VITE_MODE=local)
- `.env.qa` - Variables para ambiente de QA (VITE_MODE=qa)
- `.env.production` - Variables para producción (VITE_MODE=produccion)

## Cómo funciona

Vite automáticamente carga el archivo correcto según el `--mode` especificado:

1. **Para producción**: `npm run build`
   - Carga `.env.production`
   - El badge NO se muestra en el header
   - URLs de producción configuradas

2. **Para QA**: `npm run build:qa`
   - Carga `.env.qa`
   - Badge amarillo "QA" en el header
   - URLs de QA configuradas

3. **Para desarrollo**: `npm run dev` o `npm run build:local`
   - Carga `.env.development`
   - Badge azul "LOCAL" en el header
   - URLs locales configuradas

## Importante

El badge del modo solo aparece en desarrollo y QA, nunca en producción.