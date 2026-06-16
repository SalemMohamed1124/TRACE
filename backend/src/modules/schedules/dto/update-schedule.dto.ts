import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ScanFrequency, ScanType } from '../../../common/enums/index.js';

export class UpdateScheduleDto {
  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsOptional()
  @IsEnum(ScanFrequency)
  frequency?: ScanFrequency;

  @IsOptional()
  @IsEnum(ScanType)
  scanType?: ScanType;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  scheduledTime?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
