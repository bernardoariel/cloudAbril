import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappHistoryService } from './whatsapp-history.service';
import { WhatsappHistoryController } from './whatsapp-history.controller';
import { WhatsappClient } from './entities/whatsapp-client.entity';
import { WhatsappMessage } from './entities/whatsapp-message.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([WhatsappClient, WhatsappMessage], 'postgresConnection')
  ],
  controllers: [WhatsappHistoryController],
  providers: [WhatsappHistoryService],
  exports: [WhatsappHistoryService]
})
export class WhatsappHistoryModule {}
