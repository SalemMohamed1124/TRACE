import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Organization } from './organization.entity.js';
import { OrganizationMember } from './organization-member.entity.js';
import { OrganizationInvitation } from './organization-invitation.entity.js';
import { User } from '../users/user.entity.js';
import {
  NotificationType,
  OrganizationInvitationStatus,
  UserRole,
} from '../../common/enums/index.js';
import { CreateOrgDto } from './dto/create-org.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { NotificationsService } from '../notifications/notifications.service.js';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['READ', 'WRITE', 'DELETE', 'MANAGE_USERS', 'MANAGE_SCANS'],
  [UserRole.EDITOR]: ['READ', 'WRITE', 'MANAGE_SCANS'],
  [UserRole.VIEWER]: ['READ'],
};

export interface OrgWithRole {
  id: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface MemberInfo {
  id: string;
  role: UserRole;
  joinedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvitationInfo {
  id: string;
  email: string;
  role: UserRole;
  status: OrganizationInvitationStatus;
  createdAt: Date;
  updatedAt: Date;
  organization: {
    id: string;
    name: string;
  };
  invitedUser: {
    id: string;
    name: string;
    email: string;
  };
  invitedBy: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface SwitchOrgResponse {
  organization: {
    id: string;
    name: string;
  };
  role: UserRole;
  permissions: string[];
}

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepo: Repository<OrganizationMember>,
    @InjectRepository(OrganizationInvitation)
    private readonly invitationRepo: Repository<OrganizationInvitation>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private normalizeOrgName(name: string): string {
    return name.trim().toLowerCase();
  }

  private cleanOrgName(name: string): string {
    if (typeof name !== 'string') {
      throw new BadRequestException('Organization name is required');
    }

    const cleanName = name.trim();
    if (!cleanName) {
      throw new BadRequestException('Organization name is required');
    }
    return cleanName;
  }

  private async assertAdmin(
    orgId: string,
    userId: string,
  ): Promise<OrganizationMember> {
    const member = await this.memberRepo.findOne({
      where: { userId, orgId, role: UserRole.ADMIN },
    });

    if (!member) {
      throw new ForbiddenException('Only admins can manage this organization');
    }

    return member;
  }

  private async assertUniqueOrgNameForUser(
    userId: string,
    name: string,
    excludeOrgId?: string,
  ): Promise<void> {
    const normalizedName = this.normalizeOrgName(name);
    const memberships = await this.memberRepo.find({
      where: { userId },
      relations: ['organization'],
    });

    const duplicate = memberships.find(
      (member) =>
        member.orgId !== excludeOrgId &&
        this.normalizeOrgName(member.organization.name) === normalizedName,
    );

    if (duplicate) {
      throw new ConflictException(
        'You already have an organization with this name',
      );
    }
  }

  private toOrgWithRole(org: Organization, role: UserRole): OrgWithRole {
    return {
      id: org.id,
      name: org.name,
      role,
      createdAt: org.createdAt,
    };
  }

  private toInvitationInfo(invitation: OrganizationInvitation): InvitationInfo {
    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      createdAt: invitation.createdAt,
      updatedAt: invitation.updatedAt,
      organization: {
        id: invitation.organization.id,
        name: invitation.organization.name,
      },
      invitedUser: {
        id: invitation.invitedUser.id,
        name: invitation.invitedUser.name,
        email: invitation.invitedUser.email,
      },
      invitedBy: invitation.invitedBy
        ? {
            id: invitation.invitedBy.id,
            name: invitation.invitedBy.name,
            email: invitation.invitedBy.email,
          }
        : null,
    };
  }

  async createOrganization(
    userId: string,
    dto: CreateOrgDto,
  ): Promise<OrgWithRole> {
    const name = this.cleanOrgName(dto.name);
    await this.assertUniqueOrgNameForUser(userId, name);

    const org = this.orgRepo.create({ name });
    const savedOrg = await this.orgRepo.save(org);

    const member = this.memberRepo.create({
      userId,
      orgId: savedOrg.id,
      role: UserRole.ADMIN,
    });
    await this.memberRepo.save(member);

    return this.toOrgWithRole(savedOrg, UserRole.ADMIN);
  }

  async getUserOrganizations(userId: string): Promise<OrgWithRole[]> {
    const members = await this.memberRepo.find({
      where: { userId },
      relations: ['organization'],
      order: { joinedAt: 'ASC' },
    });

    return members.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      role: m.role,
      createdAt: m.organization.createdAt,
    }));
  }

  async switchOrganization(
    userId: string,
    orgId: string,
  ): Promise<SwitchOrgResponse> {
    const member = await this.memberRepo.findOne({
      where: { userId, orgId },
      relations: ['organization'],
    });

    if (!member) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    return {
      organization: {
        id: member.organization.id,
        name: member.organization.name,
      },
      role: member.role,
      permissions: ROLE_PERMISSIONS[member.role],
    };
  }

  async updateOrganization(
    orgId: string,
    userId: string,
    name: string,
  ): Promise<OrgWithRole> {
    const cleanName = this.cleanOrgName(name);
    const member = await this.assertAdmin(orgId, userId);
    await this.assertUniqueOrgNameForUser(userId, cleanName, orgId);

    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    org.name = cleanName;
    const savedOrg = await this.orgRepo.save(org);
    return this.toOrgWithRole(savedOrg, member.role);
  }

  async deleteOrganization(orgId: string, userId: string): Promise<void> {
    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    await this.assertAdmin(orgId, userId);

    const orgCount = await this.memberRepo.count({ where: { userId } });
    if (orgCount <= 1) {
      throw new BadRequestException('Cannot delete your last organization');
    }

    // CASCADE will clean up members, assets, scans, etc.
    await this.orgRepo.remove(org);
  }

  async getMembers(orgId: string, userId: string): Promise<MemberInfo[]> {
    await this.assertAdmin(orgId, userId);

    const members = await this.memberRepo.find({
      where: { orgId },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });

    return members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt,
      user: {
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
      },
    }));
  }

  async createInvitation(
    orgId: string,
    userId: string,
    dto: CreateInvitationDto | AddMemberDto,
  ): Promise<InvitationInfo> {
    await this.assertAdmin(orgId, userId);

    const org = await this.orgRepo.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const email = dto.email.trim().toLowerCase();
    const user = await this.userRepo.findOne({
      where: { email: ILike(email) },
    });
    if (!user) {
      throw new NotFoundException('User with this email was not found');
    }

    const existingMember = await this.memberRepo.findOne({
      where: { userId: user.id, orgId },
    });
    if (existingMember) {
      throw new ConflictException(
        'User is already a member of this organization',
      );
    }

    const existingInvitation = await this.invitationRepo.findOne({
      where: {
        invitedUserId: user.id,
        orgId,
        status: OrganizationInvitationStatus.PENDING,
      },
      relations: ['organization', 'invitedUser', 'invitedBy'],
    });

    if (existingInvitation) {
      return this.toInvitationInfo(existingInvitation);
    }

    const invitation = this.invitationRepo.create({
      email: user.email,
      invitedUserId: user.id,
      invitedByUserId: userId,
      orgId,
      role: dto.role,
      status: OrganizationInvitationStatus.PENDING,
    });
    const savedInvitation = await this.invitationRepo.save(invitation);

    await this.notificationsService.createForUser({
      userId: user.id,
      type: NotificationType.ORG_INVITATION,
      message: `You were invited to join ${org.name}.`,
      metadata: { organizationId: org.id, invitationId: savedInvitation.id },
    });

    const fullInvitation = await this.invitationRepo.findOneOrFail({
      where: { id: savedInvitation.id },
      relations: ['organization', 'invitedUser', 'invitedBy'],
    });

    return this.toInvitationInfo(fullInvitation);
  }

  async addMember(
    orgId: string,
    userId: string,
    dto: AddMemberDto,
  ): Promise<InvitationInfo> {
    return this.createInvitation(orgId, userId, dto);
  }

  async getOrganizationInvitations(
    orgId: string,
    userId: string,
  ): Promise<InvitationInfo[]> {
    await this.assertAdmin(orgId, userId);

    const invitations = await this.invitationRepo.find({
      where: { orgId, status: OrganizationInvitationStatus.PENDING },
      relations: ['organization', 'invitedUser', 'invitedBy'],
      order: { createdAt: 'DESC' },
    });

    return invitations.map((invitation) => this.toInvitationInfo(invitation));
  }

  async getMyInvitations(userId: string): Promise<InvitationInfo[]> {
    const invitations = await this.invitationRepo.find({
      where: {
        invitedUserId: userId,
        status: OrganizationInvitationStatus.PENDING,
      },
      relations: ['organization', 'invitedUser', 'invitedBy'],
      order: { createdAt: 'DESC' },
    });

    return invitations.map((invitation) => this.toInvitationInfo(invitation));
  }

  async cancelInvitation(
    orgId: string,
    userId: string,
    invitationId: string,
  ): Promise<{ success: boolean }> {
    await this.assertAdmin(orgId, userId);

    const invitation = await this.invitationRepo.findOne({
      where: {
        id: invitationId,
        orgId,
        status: OrganizationInvitationStatus.PENDING,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = OrganizationInvitationStatus.CANCELLED;
    await this.invitationRepo.save(invitation);
    return { success: true };
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<OrgWithRole> {
    const invitation = await this.invitationRepo.findOne({
      where: {
        id: invitationId,
        invitedUserId: userId,
        status: OrganizationInvitationStatus.PENDING,
      },
      relations: ['organization'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const existingMember = await this.memberRepo.findOne({
      where: { userId, orgId: invitation.orgId },
    });

    let acceptedRole = invitation.role;
    if (!existingMember) {
      const member = this.memberRepo.create({
        userId,
        orgId: invitation.orgId,
        role: invitation.role,
      });
      await this.memberRepo.save(member);
    } else {
      acceptedRole = existingMember.role;
    }

    invitation.status = OrganizationInvitationStatus.ACCEPTED;
    await this.invitationRepo.save(invitation);

    return this.toOrgWithRole(invitation.organization, acceptedRole);
  }

  async declineInvitation(
    invitationId: string,
    userId: string,
  ): Promise<{ success: boolean }> {
    const invitation = await this.invitationRepo.findOne({
      where: {
        id: invitationId,
        invitedUserId: userId,
        status: OrganizationInvitationStatus.PENDING,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = OrganizationInvitationStatus.DECLINED;
    await this.invitationRepo.save(invitation);
    return { success: true };
  }

  async updateMemberRole(
    orgId: string,
    userId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<MemberInfo> {
    await this.assertAdmin(orgId, userId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, orgId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Cannot demote the last admin
    if (member.role === UserRole.ADMIN && dto.role !== UserRole.ADMIN) {
      const adminCount = await this.memberRepo.count({
        where: { orgId, role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last admin of the organization',
        );
      }
    }

    member.role = dto.role;
    const updatedMember = await this.memberRepo.save(member);

    return {
      id: updatedMember.id,
      role: updatedMember.role,
      joinedAt: updatedMember.joinedAt,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
      },
    };
  }

  async removeMember(
    orgId: string,
    userId: string,
    memberId: string,
  ): Promise<{ success: boolean }> {
    await this.assertAdmin(orgId, userId);

    const member = await this.memberRepo.findOne({
      where: { id: memberId, orgId },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Cannot remove the last admin
    if (member.role === UserRole.ADMIN) {
      const adminCount = await this.memberRepo.count({
        where: { orgId, role: UserRole.ADMIN },
      });

      if (adminCount <= 1) {
        throw new BadRequestException(
          'Cannot remove the last admin of the organization',
        );
      }
    }

    await this.memberRepo.remove(member);
    return { success: true };
  }
}
