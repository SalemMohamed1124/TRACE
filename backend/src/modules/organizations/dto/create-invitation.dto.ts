import { IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/index.js';

export class CreateInvitationDto {
  @IsEmail()
  email!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}
