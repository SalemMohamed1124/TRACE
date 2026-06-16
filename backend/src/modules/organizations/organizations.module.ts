import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './organization.entity.js';
import { OrganizationMember } from './organization-member.entity.js';
import { OrganizationInvitation } from './organization-invitation.entity.js';
import { User } from '../users/user.entity.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationMember,
      OrganizationInvitation,
      User,
    ]),
    NotificationsModule,
  ],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [TypeOrmModule, OrganizationsService],
})
export class OrganizationsModule {}
