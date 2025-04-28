import api from '@/lib/axios';

interface RoleData {
  name: string;
  permissions: string[];
  isDefault: string;
}

export async function getAllRole() {
  // Try the API endpoint with "roles" (plural)
  const res = await api.get('/api/v1/roles/global');
  return res.data;
}

export async function deleteRole(roleId: string) {
  const res = await api.delete(`/api/v1/roles/${roleId}`);
  return res.data;
}

export async function getAllRolePermissions(roleId: string) {
  const res = await api.get(`/api/v1/roles/${roleId}/permissions`);
  return res.data;
}

export async function createRole(roleData: RoleData) {
  // Validate data before sending
  if (!roleData.name || !roleData.permissions?.length) {
    throw new Error('Name and permissions are required');
  }
  
  // Ensure we're using the correct data structure
  const requestData = {
    name: roleData.name,
    permissions: roleData.permissions,
    isdefault: roleData.isDefault || false,
  };
    // Make the API request with the roleData using the plural endpoint
    const response = await api.post('/api/v1/roles/global', requestData);
    return response.data;

}