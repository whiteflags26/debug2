import { Request } from 'express';
import { Types } from 'mongoose';
import AdminActionLog, { IAdminActionLog } from './adminActions.model';

export class AdminLoggerService {
  /**
   * Log an admin action
   */
  public async logAction(
    userId: Types.ObjectId | string,
    action: string,
    entityType: string,
    details: any = {},
    req?: Request,
    entityId?: Types.ObjectId | string,
  ): Promise<IAdminActionLog> {
    const userObjectId =
      typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
    const entityObjectId =
      entityId && typeof entityId === 'string'
        ? new Types.ObjectId(entityId)
        : entityId;

    const log = new AdminActionLog({
      userId: userObjectId,
      action,
      entityType,
      entityId: entityObjectId,
      details,
      ipAddress: req?.ip ?? req?.headers['x-forwarded-for'] ?? 'unknown',
      userAgent: req?.headers['user-agent'] ?? 'unknown',
      timestamp: new Date(),
    });

    return await log.save();
  }

  /**
   * Get logs for a specific user
   */
  public async getLogsByUser(
    userId: Types.ObjectId | string,
    limit = 100,
    skip = 0,
  ): Promise<IAdminActionLog[]> {
    return AdminActionLog.find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
  }

  /**
   * Get logs for a specific entity
   */
  public async getLogsByEntity(
    entityType: string,
    entityId: Types.ObjectId | string,
    limit = 100,
    skip = 0,
  ): Promise<IAdminActionLog[]> {
    return AdminActionLog.find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
  }

  /**
   * Get all admin action logs with pagination
   */
  public async getAllLogs(
    limit = 100,
    skip = 0,
    filters = {},
  ): Promise<IAdminActionLog[]> {
    return AdminActionLog.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();
  }
}

export const adminLoggerService = new AdminLoggerService();
