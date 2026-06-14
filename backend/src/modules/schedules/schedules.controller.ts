import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRole } from '../../common/enums/index.js';
import { SchedulesService } from './schedules.service.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';

@Controller('scan-schedules')
@Roles(UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER)
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  async findAll(@Req() req: any) {
    const orgId: string = req.orgContext!.orgId;
    const data = await this.schedulesService.findAll(orgId);
    return { data };
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async create(@Req() req: any, @Body() dto: CreateScheduleDto) {
    const orgId: string = req.orgContext!.orgId;
    const userId: string = req.user.userId;
    return this.schedulesService.create(orgId, userId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async update(
    @Param('id') id: string,
    @Req() req: any,
    @Body() dto: UpdateScheduleDto,
  ) {
    const orgId: string = req.orgContext!.orgId;
    return this.schedulesService.update(id, orgId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  async remove(@Param('id') id: string, @Req() req: any) {
    const orgId: string = req.orgContext!.orgId;
    return this.schedulesService.remove(id, orgId);
  }
}
