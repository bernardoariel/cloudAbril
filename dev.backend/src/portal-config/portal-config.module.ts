import { Module } from '@nestjs/common';
import { PortalConfigController } from './portal-config.controller';
import { PortalConfigService } from './portal-config.service';
import { PortalKeyOrJwtGuard } from './portal-key-or-jwt.guard';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PortalConfigController],
  providers: [PortalConfigService, PortalKeyOrJwtGuard],
})
export class PortalConfigModule {}
