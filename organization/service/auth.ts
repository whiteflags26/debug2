import api from '@/lib/axios';
import { ApiResponse } from '@/types/api-response';
import { HasAccessRequest } from '@/types/organization';
import { AxiosError } from 'axios';

export const hasOrgAccess = async (id: string) => {
  try {
    const { data } = await api.get<ApiResponse<HasAccessRequest>>(
      `/api/v1/users/organizations/${id}/check-access`,
    );
    return data.data || { hasAccess: false };
  } catch (error) {
    console.error('Organization access check failed:', error);
    // Return a default response indicating no access
    return { hasAccess: false };
  }
};