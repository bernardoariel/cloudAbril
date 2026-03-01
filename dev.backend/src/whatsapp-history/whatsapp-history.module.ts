import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { WhatsappHistoryService } from './whatsapp-history.service';
import { WhatsappHistoryController } from './whatsapp-history.controller';
import { WhatsappClient } from './entities/whatsapp-client.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';
import { WsWebhookController } from './ws-webhook.controller';
import { WsWebhookService } from './ws-webhook.service';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappClient, WhatsappMessage], 'postgresConnection'),
    HttpModule,
    AuthModule,
  ],
  controllers: [WhatsappHistoryController, WsWebhookController],
  providers: [WhatsappHistoryService, WsWebhookService],
  exports: [WhatsappHistoryService, WsWebhookService]
})
export class WhatsappHistoryModule {}
