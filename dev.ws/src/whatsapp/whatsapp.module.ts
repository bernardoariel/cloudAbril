import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { WebhookService } from './webhook.service';
import { WsIncomingMessage } from './entities/ws-incoming-message.entity';
import { WsWebhookEvent } from './entities/ws-webhook-event.entity';

@Module({
  imports: [
    ConfigModule,    
    HttpModule,
    TypeOrmModule.forFeature([WsIncomingMessage, WsWebhookEvent]),
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, WebhookService],
  exports: [WhatsAppService, WebhookService],
})
export class WhatsAppModule { }
