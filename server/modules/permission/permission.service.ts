import ErrorResponse from '../../utils/errorResponse';
import Permission, { PermissionScope } from './permission.model';

class PermissionService {
  public async getAllPermissions() {
    try {
      const permissions = await Permission.find()
        .select('name description scope')
        .lean();

      return permissions;
    } catch (error: any) {
      throw new ErrorResponse(
        error.message ?? 'Failed to fetch permissions',
        500,
      );
    }
  }

  public async getPermissionsByScope(scope: PermissionScope) {
    try {
      const permissions = await Permission.find({ scope })
        .select('name description scope')
        .lean();

      return permissions;
    } catch (error: any) {
      throw new ErrorResponse(
        error.message ?? `Failed to fetch ${scope} permissions`,
        500,
      );
    }
  }
}

export const permissionService = new PermissionService();
