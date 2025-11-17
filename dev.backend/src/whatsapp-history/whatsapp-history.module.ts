import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappHistoryService } from './whatsapp-history.service';
import { WhatsappHistoryController } from './whatsapp-history.controller';
import { WhatsAppMessage } from './entities/whatsapp-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsAppMessage], 'postgresConnection')
  ],
  controllers: [WhatsappHistoryController],
  providers: [WhatsappHistoryService],
  exports: [WhatsappHistoryService]
})
export class WhatsappHistoryModule {}
