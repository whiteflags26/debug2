import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../shared/middleware/async';
import ErrorResponse from '../../utils/errorResponse';
import { AuthRequest } from '../auth/auth.middleware';
import { roleService } from './role.service';

interface UpdateRoleBody {
  name?: string;
  permissions?: string[]; // Array of permission IDs
}

interface CreateRoleBody {
  name: string;
  permissions: string[];
  isDefault?: boolean;
}

/**
 * @route   GET /api/v1/organizations/:organizationId/roles
 * @desc    Get all roles in an organization
 * @access  Private (Requires 'view_organization_roles' permission)
 */
export const getOrganizationRoles = asyncHandler(
  async (
    req: AuthRequest & { params: { organizationId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { organizationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return next(new ErrorResponse('Invalid Organization ID', 400));
    }

    const roles = await roleService.getRolesByOrganization(organizationId);

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  },
);

/**
 * @route   PUT /api/v1/organizations/:organizationId/roles/:roleId
 * @desc    Update a role in an organization
 * @access  Private (Requires 'manage_organization_roles' permission)
 */
export const updateOrganizationRole = asyncHandler(
  async (
    req: AuthRequest & {
      params: { organizationId: string; roleId: string };
      body: UpdateRoleBody;
    },
    res: Response,
    next: NextFunction,
  ) => {
    const { organizationId, roleId } = req.params;
    const updateData = req.body;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return next(new ErrorResponse('Invalid Organization ID', 400));
    }
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return next(new ErrorResponse('Invalid Role ID', 400));
    }

    // Validate update data
    if (!updateData.name && !updateData.permissions?.length) {
      return next(new ErrorResponse('No valid update data provided', 400));
    }

    const updatedRole = await roleService.updateOrganizationRole(
      organizationId,
      roleId,
      updateData,
    );

    res.status(200).json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully',
    });
  },
);

/**
 * @desc    Create a new global role
 * @route   POST /api/v1/roles/global
 * @access  Private (Requires 'manage_global_roles' permission)
 */
export const createGlobalRole = asyncHandler(
  async (
    req: AuthRequest & { body: CreateRoleBody },
    res: Response,
    next: NextFunction,
  ) => {
    const { name, permissions, isDefault } = req.body;
    
    

    // Validate request body
    if (!name || !permissions?.length) {
      return next(new ErrorResponse('Name and permissions are required', 400));
    }

    if (
      !permissions.every((id: string) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return next(new ErrorResponse('Invalid permission ID(s) provided', 400));
    }

    const role = await roleService.createGlobalRole({
      name,
      permissions,
      isDefault,
    });

    res.status(201).json({
      success: true,
      data: role,
      message: 'Global role created successfully',
    });
  },
);

/**
 * @desc    Create a new organization role
 * @route   POST /api/v1/roles/organization
 * @access  Private (Requires 'manage_organization_roles' permission)
 */
export const createOrganizationRole = asyncHandler(
  async (
    req: AuthRequest & { body: CreateRoleBody },
    res: Response,
    next: NextFunction,
  ) => {
    const { name, permissions, isDefault } = req.body;

    // Validate request body
    if (!name || !permissions?.length) {
      return next(new ErrorResponse('Name and permissions are required', 400));
    }

    // Validate permission IDs
    if (
      !permissions.every((id: string) => mongoose.Types.ObjectId.isValid(id))
    ) {
      return next(new ErrorResponse('Invalid permission ID(s) provided', 400));
    }

    const role = await roleService.createOrganizationRole({
      name,
      permissions,
      isDefault,
    });

    res.status(201).json({
      success: true,
      data: role,
      message: 'Organization role created successfully',
    });
  },
);

/**
 * @desc    Get all global roles
 * @route   GET /api/v1/roles/global
 * @access  Private (Requires 'view_global_roles' permission)
 */
export const getGlobalRoles = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const roles = await roleService.getGlobalRoles();

    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  },
);

/**
 * @desc    Get role by ID
 * @route   GET /api/v1/roles/:roleId
 * @access  Private (Requires 'view_roles' permission)
 */
export const getRoleById = asyncHandler(
  async (
    req: AuthRequest & { params: { roleId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { roleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return next(new ErrorResponse('Invalid Role ID', 400));
    }

    const role = await roleService.getRoleById(roleId);

    res.status(200).json({
      success: true,
      data: role,
    });
  },
);

/**
 * @desc    Get permissions for a role
 * @route   GET /api/v1/roles/:roleId/permissions
 * @access  Private
 */
export const getRolePermissions = asyncHandler(
  async (
    req: AuthRequest & { params: { roleId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { roleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return next(new ErrorResponse('Invalid role ID', 400));
    }

    const permissions = await roleService.getRolePermissions(roleId);

    res.status(200).json({
      success: true,
      data: permissions,
    });
  },
);

/**
 * @desc    Delete role by ID
 * @route   DELETE /api/v1/roles/:roleId
 * @access  Private (Requires appropriate scope permission)
 */
export const deleteRole = asyncHandler(
  async (
    req: AuthRequest & { params: { roleId: string } },
    res: Response,
    next: NextFunction,
  ) => {
    const { roleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return next(new ErrorResponse('Invalid Role ID', 400));
    }

    await roleService.deleteRole(roleId);

    res.status(200).json({
      success: true,
      message: 'Role deleted successfully',
    });
  },
);
