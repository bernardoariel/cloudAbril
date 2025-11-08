import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { LoggerService } from './utils/logger.service';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  // Asegurarse de que existe el directorio de logs
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  dotenv.config();
  const app = await NestFactory.create(AppModule);
  const logger = app.get(LoggerService);

  // Configurar manejo global de excepciones no controladas
  process.on('unhandledRejection', (reason, promise) => {
    logger.logError('Promesa rechazada no controlada', reason as Error, 'Process');
  });

  process.on('uncaughtException', (error) => {
    logger.logError('Excepción no controlada', error, 'Process');
    process.exit(1); // Es recomendable reiniciar la aplicación después de una excepción no controlada
  });

  // Habilitar CORS
  app.enableCors({
    origin: true, // Permite todas las origenes en desarrollo
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Aplicar validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT ?? 3010;
  await app.listen(port);

  logger.logInfo(`Servidor iniciado en el puerto ${port}`, 'Bootstrap');
}
bootstrap();
