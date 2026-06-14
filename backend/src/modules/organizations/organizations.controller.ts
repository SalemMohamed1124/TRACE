import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service.js';
import { CreateOrgDto } from './dto/create-org.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { JwtUser } from '../auth/decorators/current-user.decorator.js';

@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@CurrentUser() user: JwtUser, @Body() dto: CreateOrgDto) {
    return this.organizationsService.createOrganization(user.userId, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: JwtUser) {
    return this.organizationsService.getUserOrganizations(user.userId);
  }

  @Post('switch')
  @HttpCode(HttpStatus.OK)
  async switchOrg(
    @CurrentUser() user: JwtUser,
    @Body('orgId', ParseUUIDPipe) orgId: string,
  ) {
    return this.organizationsService.switchOrganization(user.userId, orgId);
  }

  @Patch(':orgId')
  @HttpCode(HttpStatus.OK)
  async updateOrganization(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @CurrentUser() user: JwtUser,
    @Body('name') name: string,
  ) {
    return this.organizationsService.updateOrganization(
      orgId,
      user.userId,
      name,
    );
  }

  @Delete(':orgId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteOrganization(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @CurrentUser() user: JwtUser,
  ) {
    await this.organizationsService.deleteOrganization(orgId, user.userId);
  }

  @Get(':orgId/members')
  @HttpCode(HttpStatus.OK)
  async getMembers(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.organizationsService.getMembers(orgId, user.userId);
  }

  @Post(':orgId/members')
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: AddMemberDto,
  ) {
    return this.organizationsService.addMember(orgId, user.userId, dto);
  }

  @Patch(':orgId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: JwtUser,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(
      orgId,
      user.userId,
      memberId,
      dto,
    );
  }

  @Delete(':orgId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('orgId', ParseUUIDPipe) orgId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.organizationsService.removeMember(orgId, user.userId, memberId);
  }
}
