import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import {
  OrganizationInvitationStatus,
  UserRole,
} from '../../common/enums/index.js';
import { User } from '../users/user.entity.js';
import { Organization } from './organization.entity.js';

@Entity('organization_invitations')
@Index(['orgId', 'invitedUserId', 'status'])
export class OrganizationInvitation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    enumName: 'organization_members_role_enum',
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: OrganizationInvitationStatus,
    enumName: 'organization_invitations_status_enum',
    default: OrganizationInvitationStatus.PENDING,
  })
  status!: OrganizationInvitationStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  organization!: Organization;

  @Column({ name: 'org_id' })
  orgId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_user_id' })
  invitedUser!: User;

  @Column({ name: 'invited_user_id' })
  invitedUserId!: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'invited_by_user_id' })
  invitedBy!: User | null;

  @Column({ name: 'invited_by_user_id', nullable: true })
  invitedByUserId!: string | null;
}
