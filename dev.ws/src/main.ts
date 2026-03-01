import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'https://admin.abrilviveenvos.com',
      'https://abrilviveenvos.com',
      'http://localhost:5173',
      'http://localhost:4173',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept,Origin,X-Requested-With',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const port = process.env.PORT ?? 3010;
  await app.listen(port);
  console.log(`Servidor iniciado en el puerto ${port}`, 'Bootstrap');
}
bootstrap();
