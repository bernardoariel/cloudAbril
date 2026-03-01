import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsAppModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST_POSTGRES', '127.0.0.1'),
        port: configService.get<number>('DB_PORT_POSTGRES', 5432),
        username: configService.get<string>('DB_USERNAME_POSTGRES', 'postgres'),
        password: configService.get<string>('DB_PASSWORD_POSTGRES', 'postgres'),
        database: configService.get<string>('DB_DATABASE_POSTGRES', 'MyPostgresDB'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
      }),
    }),
    WhatsAppModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
