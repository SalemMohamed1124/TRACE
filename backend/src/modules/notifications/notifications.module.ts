import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanFinding } from '../findings/scan-finding.entity.js';
import { OrganizationMember } from '../organizations/organization-member.entity.js';
import { Scan } from '../scans/scan.entity.js';
import { Notification } from './notification.entity.js';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      OrganizationMember,
      Scan,
      ScanFinding,
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [TypeOrmModule, NotificationsService],
})
export class NotificationsModule {}
