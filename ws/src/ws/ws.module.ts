import { Module } from '@nestjs/common';
import { WsService } from './ws.service';
import { WsController } from './ws.controller';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,     // ya es global en AppModule, pero no molesta
    HttpModule,       // <-- CLAVE para HttpService
  ],
  controllers: [WsController],
  providers: [WsService],
  exports: [WsService],
})
export class WsModule { }
