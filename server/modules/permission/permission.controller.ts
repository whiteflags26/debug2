import { NextFunction, Request, Response } from 'express';
import asyncHandler from '../../shared/middleware/async';
import { PermissionScope } from './permission.model';
import { permissionService } from './permission.service';

export const getAllPermissions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const permissions = await permissionService.getAllPermissions();

    res.status(200).json({
      success: true,
      data: permissions,
    });
  },
);

export const getGlobalPermissions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const permissions = await permissionService.getPermissionsByScope(
      PermissionScope.GLOBAL,
    );

    res.status(200).json({
      success: true,
      data: permissions,
    });
  },
);

export const getLocalPermissions = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const permissions = await permissionService.getPermissionsByScope(
      PermissionScope.ORGANIZATION,
    );

    res.status(200).json({
      success: true,
      data: permissions,
    });
  },
);
