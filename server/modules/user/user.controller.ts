import { NextFunction, Response } from 'express';
import asyncHandler from '../../shared/middleware/async';
import { AuthRequest } from '../auth/auth.middleware';
import { userService } from './user.service';
import ErrorResponse from '../../utils/errorResponse'

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private (Requires 'view_users' permission)
 */
export const getUsersAdmin = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const users = await userService.getAllUsersAdmin();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  },
);

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:userId
 * @access  Private (Requires 'view_users' permission)
 */
export const getUserByIdAdmin = asyncHandler(
  async (
    req: AuthRequest & { params: { userId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { userId } = req.params;
    const user = await userService.getUserByIdAdmin(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  },
);

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/users/me
 * @access  Private
 */
export const getCurrentUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    const userProfile = await userService.getCurrentUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  }
);

/**
 * @desc    Update current user profile
 * @route   PUT /api/v1/users/me
 * @access  Private
 */
export const updateUserProfile = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    const userProfile = await userService.updateUserProfile(req.user.id, req.body);

    res.status(200).json({
      success: true,
      data: userProfile,
    });
  }
);

/**
 * @desc    Change user password
 * @route   PUT /api/v1/users/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new ErrorResponse('Please provide both current and new password', 400);
    }

    const result = await userService.changeUserPassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    res.status(200).json(result);
  }
);

/**
 * @desc    Get organizations where user has a role
 * @route   GET /api/v1/users/organizations
 * @access  Private
 */
export const getUserOrganizations = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user?.id) {
      throw new ErrorResponse('Not authorized to access this route', 401);
    }

    const organizations = await userService.getUserOrganizations(req.user.id);

    res.status(200).json({
      success: true,
      count: organizations.length,
      data: organizations,
    });
  }
);