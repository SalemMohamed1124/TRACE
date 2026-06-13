import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { OrganizationMember } from '../organizations/organization-member.entity.js';
import { Notification } from '../notifications/notification.entity.js';
import { Scan } from '../scans/scan.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 255, name: 'password_reset_token', nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'timestamptz', name: 'password_reset_expires', nullable: true })
  passwordResetExpires!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => OrganizationMember, (member) => member.user)
  organizationMembers!: OrganizationMember[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Scan, (scan) => scan.initiatedByUser)
  scans!: Scan[];
}
