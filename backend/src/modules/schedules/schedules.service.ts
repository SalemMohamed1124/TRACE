import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScanSchedule } from './scan-schedule.entity.js';
import { Asset } from '../assets/asset.entity.js';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { calculateNextRunAt, createAnchor } from './schedule-next-run.js';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(ScanSchedule)
    private readonly scheduleRepo: Repository<ScanSchedule>,
    @InjectRepository(Asset)
    private readonly assetRepo: Repository<Asset>,
  ) {}

  async findAll(orgId: string): Promise<ScanSchedule[]> {
    return this.scheduleRepo.find({
      where: { orgId },
      relations: ['asset'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    orgId: string,
    userId: string,
    dto: CreateScheduleDto,
  ): Promise<ScanSchedule> {
    const asset = await this.assetRepo.findOne({
      where: { id: dto.assetId, orgId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found in this organization');
    }

    const now = new Date();
    const anchor = createAnchor(now);

    const schedule = this.scheduleRepo.create({
      assetId: dto.assetId,
      orgId,
      createdBy: userId,
      frequency: dto.frequency,
      scanType: dto.scanType,
      timeOfDay: dto.scheduledTime,
      dayOfWeek: anchor.dayOfWeek,
      dayOfMonth: anchor.dayOfMonth,
      nextRunAt: calculateNextRunAt(
        dto.frequency,
        dto.scheduledTime,
        now,
        anchor,
      ),
      isActive: true,
    });

    const saved = await this.scheduleRepo.save(schedule);
    return this.findOne(saved.id, orgId);
  }

  async update(
    id: string,
    orgId: string,
    dto: UpdateScheduleDto,
  ): Promise<ScanSchedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id, orgId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (dto.assetId && dto.assetId !== schedule.assetId) {
      const asset = await this.assetRepo.findOne({
        where: { id: dto.assetId, orgId },
      });

      if (!asset) {
        throw new NotFoundException('Asset not found in this organization');
      }

      schedule.assetId = dto.assetId;
    }

    const recurrenceChanged =
      dto.frequency !== undefined ||
      dto.scheduledTime !== undefined ||
      dto.isActive !== undefined;

    if (dto.scanType !== undefined) {
      schedule.scanType = dto.scanType;
    }

    if (dto.frequency !== undefined) {
      schedule.frequency = dto.frequency;
    }

    if (dto.scheduledTime !== undefined) {
      schedule.timeOfDay = dto.scheduledTime;
    }

    if (dto.isActive !== undefined) {
      schedule.isActive = dto.isActive;
    }

    if (recurrenceChanged && schedule.isActive) {
      const now = new Date();
      const anchor = createAnchor(now);
      schedule.dayOfWeek = anchor.dayOfWeek;
      schedule.dayOfMonth = anchor.dayOfMonth;
      schedule.nextRunAt = calculateNextRunAt(
        schedule.frequency,
        schedule.timeOfDay,
        now,
        anchor,
      );
    }

    const saved = await this.scheduleRepo.save(schedule);
    return this.findOne(saved.id, orgId);
  }

  async remove(id: string, orgId: string): Promise<{ success: boolean }> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id, orgId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    await this.scheduleRepo.remove(schedule);
    return { success: true };
  }

  private async findOne(id: string, orgId: string): Promise<ScanSchedule> {
    const schedule = await this.scheduleRepo.findOne({
      where: { id, orgId },
      relations: ['asset'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }
}
