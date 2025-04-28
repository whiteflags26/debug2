import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../shared/middleware/async';
import ErrorResponse from '../../utils/errorResponse';
import { AuthRequest } from '../auth/auth.middleware';
import { adminLoggerService } from './adminActions.service';

/**
 * @route   GET /api/v1/admin/logs
 * @desc    Get all admin action logs with pagination and filters
 * @access  Private (Admin only)
 */
export const getAdminLogs = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Extract filters
    const filters: any = {};

    if (
      req.query.userId &&
      mongoose.Types.ObjectId.isValid(req.query.userId as string)
    ) {
      filters.userId = new mongoose.Types.ObjectId(req.query.userId as string);
    }

    if (req.query.action) {
      filters.action = req.query.action;
    }

    if (req.query.entityType) {
      filters.entityType = req.query.entityType;
    }

    if (
      req.query.entityId &&
      mongoose.Types.ObjectId.isValid(req.query.entityId as string)
    ) {
      filters.entityId = new mongoose.Types.ObjectId(
        req.query.entityId as string,
      );
    }

    // Date range filtering
    if (req.query.startDate) {
      filters.timestamp ??= {};
      filters.timestamp.$gte = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.timestamp ??= {};
      filters.timestamp.$lte = new Date(req.query.endDate as string);
    }

    const logs = await adminLoggerService.getAllLogs(limit, skip, filters);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  },
);

/**
 * @route   GET /api/v1/admin/logs/user/:userId
 * @desc    Get logs for a specific user
 * @access  Private (Admin only)
 */
export const getUserLogs = asyncHandler(
  async (
    req: AuthRequest & { params: { userId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse('Invalid User ID', 400));
    }

    const logs = await adminLoggerService.getLogsByUser(userId, limit, skip);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  },
);

/**
 * @route   GET /api/v1/admin/logs/entity/:entityType/:entityId
 * @desc    Get logs for a specific entity
 * @access  Private (Admin only)
 */
export const getEntityLogs = asyncHandler(
  async (
    req: AuthRequest & { params: { entityType: string; entityId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { entityType, entityId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(entityId)) {
      return next(new ErrorResponse('Invalid Entity ID', 400));
    }

    const logs = await adminLoggerService.getLogsByEntity(
      entityType,
      entityId,
      limit,
      skip,
    );

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  },
);
