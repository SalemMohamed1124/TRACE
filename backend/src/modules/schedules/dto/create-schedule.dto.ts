import { IsEnum, IsString, IsUUID, Matches } from 'class-validator';
import { ScanFrequency, ScanType } from '../../../common/enums/index.js';

export class CreateScheduleDto {
  @IsUUID()
  assetId!: string;

  @IsEnum(ScanFrequency)
  frequency!: ScanFrequency;

  @IsEnum(ScanType)
  scanType!: ScanType;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  scheduledTime!: string;
}
