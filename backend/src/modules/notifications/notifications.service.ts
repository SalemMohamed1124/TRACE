import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationType, SeverityLevel } from '../../common/enums/index.js';
import { ScanFinding } from '../findings/scan-finding.entity.js';
import { OrganizationMember } from '../organizations/organization-member.entity.js';
import { Scan } from '../scans/scan.entity.js';
import { Notification } from './notification.entity.js';

export interface NotificationMetadata {
  organizationId?: string;
  scanId?: string;
  assetId?: string;
  invitationId?: string;
  projectId?: string;
  severity?: SeverityLevel;
  findingsCount?: number;
  criticalCount?: number;
  riskScore?: number;
  error?: string;
}

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  message: string;
  metadata?: NotificationMetadata;
}

interface ScanEventPayload {
  scanId: string;
  orgId?: string;
  assetId?: string;
  findingsCount?: number;
  criticalCount?: number;
  error?: string;
}

interface AiAnalysisCompletedPayload {
  scanId: string;
  riskScore?: number;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(OrganizationMember)
    private readonly memberRepo: Repository<OrganizationMember>,
    @InjectRepository(Scan)
    private readonly scanRepo: Repository<Scan>,
    @InjectRepository(ScanFinding)
    private readonly findingRepo: Repository<ScanFinding>,
  ) {}

  async findAll(userId: string, limit = 20): Promise<Notification[]> {
    const take = Number.isFinite(limit)
      ? Math.min(Math.max(limit, 1), 100)
      : 20;

    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take,
    });
  }

  async createForUser(input: CreateNotificationInput): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId: input.userId,
      type: input.type,
      message: input.message,
      metadata: this.toMetadataRecord(input.metadata),
    });

    return this.notificationRepo.save(notification);
  }

  async createForUsers(
    userIds: string[],
    input: Omit<CreateNotificationInput, 'userId'>,
  ): Promise<Notification[]> {
    const uniqueUserIds = [...new Set(userIds)].filter(Boolean);
    if (uniqueUserIds.length === 0) return [];

    const notifications = uniqueUserIds.map((userId) =>
      this.notificationRepo.create({
        userId,
        type: input.type,
        message: input.message,
        metadata: this.toMetadataRecord(input.metadata),
      }),
    );

    return this.notificationRepo.save(notifications);
  }

  @OnEvent('scan.completed')
  async handleScanCompleted(payload: ScanEventPayload): Promise<void> {
    const context = await this.loadScanNotificationContext(payload.scanId);
    if (!context) return;

    const metadata = this.buildScanMetadata(context.scan, {
      findingsCount: payload.findingsCount,
      criticalCount: payload.criticalCount,
    });

    await this.createForUsers(context.userIds, {
      type: NotificationType.SCAN_COMPLETE,
      message: `Scan completed for ${context.assetLabel} with ${payload.findingsCount ?? 0} findings.`,
      metadata,
    });

    const criticalCount =
      payload.criticalCount ??
      (await this.countCriticalFindings(payload.scanId));
    if (criticalCount > 0) {
      await this.createForUsers(context.userIds, {
        type: NotificationType.CRITICAL_VULN,
        message: `${criticalCount} critical ${criticalCount === 1 ? 'vulnerability was' : 'vulnerabilities were'} found in ${context.assetLabel}.`,
        metadata: {
          ...metadata,
          severity: SeverityLevel.CRITICAL,
          criticalCount,
        },
      });
    }
  }

  @OnEvent('scan.failed')
  async handleScanFailed(payload: ScanEventPayload): Promise<void> {
    const context = await this.loadScanNotificationContext(payload.scanId);
    if (!context) return;

    await this.createForUsers(context.userIds, {
      type: NotificationType.SCAN_FAILED,
      message: `Scan failed for ${context.assetLabel}.`,
      metadata: this.buildScanMetadata(context.scan, { error: payload.error }),
    });
  }

  @OnEvent('ai.analysis.completed')
  async handleAiAnalysisCompleted(
    payload: AiAnalysisCompletedPayload,
  ): Promise<void> {
    const context = await this.loadScanNotificationContext(payload.scanId);
    if (!context) return;

    await this.createForUsers(context.userIds, {
      type: NotificationType.AI_ANALYSIS_READY,
      message: `AI analysis is ready for ${context.assetLabel}.`,
      metadata: this.buildScanMetadata(context.scan, {
        riskScore: payload.riskScore,
      }),
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    return this.notificationRepo.save(notification);
  }

  async markAllAsRead(userId: string): Promise<{ success: boolean }> {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { success: true };
  }

  private async loadScanNotificationContext(scanId: string): Promise<{
    scan: Scan;
    userIds: string[];
    assetLabel: string;
  } | null> {
    const scan = await this.scanRepo.findOne({
      where: { id: scanId },
      relations: { asset: true },
    });

    if (!scan) {
      this.logger.warn(`Skipping notification for missing scan ${scanId}`);
      return null;
    }

    const members = await this.memberRepo.find({
      where: { orgId: scan.orgId },
      select: { userId: true },
    });

    return {
      scan,
      userIds: members.map((member) => member.userId),
      assetLabel: scan.asset?.name ?? scan.asset?.value ?? 'scan target',
    };
  }

  private buildScanMetadata(
    scan: Scan,
    extra: Omit<
      NotificationMetadata,
      'organizationId' | 'scanId' | 'assetId'
    > = {},
  ): NotificationMetadata {
    return {
      organizationId: scan.orgId,
      scanId: scan.id,
      assetId: scan.assetId,
      ...extra,
    };
  }

  private async countCriticalFindings(scanId: string): Promise<number> {
    return this.findingRepo
      .createQueryBuilder('finding')
      .innerJoin('finding.vulnerability', 'vulnerability')
      .where('finding.scan_id = :scanId', { scanId })
      .andWhere('vulnerability.severity = :severity', {
        severity: SeverityLevel.CRITICAL,
      })
      .getCount();
  }

  private toMetadataRecord(
    metadata: NotificationMetadata | undefined,
  ): Record<string, unknown> | null {
    return metadata ? { ...metadata } : null;
  }
}
