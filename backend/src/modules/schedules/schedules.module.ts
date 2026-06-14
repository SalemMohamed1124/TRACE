import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScanSchedule } from './scan-schedule.entity.js';
import { Asset } from '../assets/asset.entity.js';
import { SchedulesController } from './schedules.controller.js';
import { SchedulesService } from './schedules.service.js';
import { ScheduleRunnerService } from './schedule-runner.service.js';
import { ScansModule } from '../scans/scans.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([ScanSchedule, Asset]), ScansModule],
  controllers: [SchedulesController],
  providers: [SchedulesService, ScheduleRunnerService],
  exports: [TypeOrmModule, SchedulesService],
})
export class SchedulesModule {}
