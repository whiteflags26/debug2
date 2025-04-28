import api from '@/lib/axios';
import { ApiResponse } from '@/types/api';
import {
  OrganizationRequest,
  OrganizationRequestsResponse,
  SingleOrganizationRequestResponse,
} from '@/types/organization';
import { AxiosError } from 'axios';

export interface RequestFilters {
  requesterEmail: string;
  ownerEmail: string;
  status: string[];
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export async function getOrganizationRequests(
  filters: RequestFilters,
): Promise<OrganizationRequestsResponse> {
  try {
    console.log('Sending filters to API:', filters);
    const { data } = await api.get('/api/v1/organization-requests', {
      params: filters,
      withCredentials: true,
    });
    console.log('Received response:', data);
    return data;
  } catch (error: any) {
    const err = error as AxiosError<{ message: string }>;
    throw new Error(
      error.response?.data?.message ?? 'Failed to fetch organization requests',
    );
  }
}

export async function getSingleOrganizationRequest(
  requestId: string,
): Promise<OrganizationRequest> {
  try {
    const response = await api.get<ApiResponse<OrganizationRequest>>(
      `/api/v1/organization-requests/admin/${requestId}`,
      {
        withCredentials: true,
      },
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ?? 'Failed to fetch organization request',
    );
  }
}

export async function processOrganizationRequest(
  requestId: string,
): Promise<OrganizationRequest> {
  try {
    const response = await api.put<ApiResponse<OrganizationRequest>>(
      `/api/v1/organization-requests/${requestId}/process`,
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ?? 'Failed to process request',
    );
  }
}
export async function CancelProcessOrganizationRequest(
  requestId: string,
): Promise<OrganizationRequest> {
  try {
    const response = await api.put<ApiResponse<OrganizationRequest>>(
      `/api/v1/organization-requests/${requestId}/cancel-processing`,
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ?? 'Failed to process request',
    );
  }
}

export async function rejectOrganizationRequest(
  requestId: string,
  adminNotes: string,
): Promise<OrganizationRequest> {
  try {
    const requestData = {
      adminNotes: adminNotes,
    };
    const response = await api.put<ApiResponse<OrganizationRequest>>(
      `/api/v1/organization-requests/${requestId}/reject`,
      requestData,
    );
    return response.data.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message ?? 'Failed to process request',
    );
  }
}

export async function createOrganization(
  payload: any,
): Promise<SingleOrganizationRequestResponse> {
  try {
    const response = await api.post('/api/v1/organizations', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error: any) {
    console.error('Create organization error:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to create organization',
    );
  }
}

// Get all facilities (already exists)
export async function getAllFacilities(): Promise<any> {
  try {
    const response = await api.get('/api/v1/facilities', {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While fetching facilities:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to fetch facilities',
    );
  }
}

// Get facility by ID
export async function getFacilityById(facilityId: string): Promise<any> {
  try {
    const response = await api.get(`/api/v1/facilities/${facilityId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While fetching facility:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to fetch facility',
    );
  }
}

// Create new facility
export async function createFacility(facilityData: any): Promise<any> {
  try {
    const response = await api.post('/api/v1/facilities', facilityData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While creating facility:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to create facility',
    );
  }
}

// Update facility
export async function updateFacility(
  facilityId: string,
  facilityData: any,
): Promise<any> {
  try {
    const response = await api.put(
      `/api/v1/facilities/${facilityId}`,
      facilityData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('While updating facility:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to update facility',
    );
  }
}

// Delete facility
export async function deleteFacility(facilityId: string): Promise<any> {
  try {
    const response = await api.delete(`/api/v1/facilities/${facilityId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While deleting facility:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to delete facility',
    );
  }
}

// Add with other interfaces at the top
export interface Sport {
  _id: string;
  name: string;
  // Add other sport properties if needed
}

// Get all sports
export async function getAllSports(): Promise<any> {
  try {
    const response = await api.get('/api/v1/sports', {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While fetching sports:', error.response?.data);
    throw new Error(error.response?.data?.message ?? 'Failed to fetch sports');
  }
}

// Get sport by ID
export async function getSportById(sportId: string): Promise<any> {
  try {
    const response = await api.get(`/api/v1/sports/${sportId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While fetching sport:', error.response?.data);
    throw new Error(error.response?.data?.message ?? 'Failed to fetch sport');
  }
}

// Create new sport
export async function createSport(sportData: any): Promise<any> {
  try {
    const response = await api.post('/api/v1/sports', sportData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While creating sport:', error.response?.data);
    throw new Error(error.response?.data?.message ?? 'Failed to create sport');
  }
}

// Update sport
export async function updateSport(
  sportId: string,
  sportData: any,
): Promise<any> {
  try {
    const response = await api.put(`/api/v1/sports/${sportId}`, sportData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While updating sport:', error.response?.data);
    throw new Error(error.response?.data?.message ?? 'Failed to update sport');
  }
}

// Delete sport
export async function deleteSport(sportId: string): Promise<any> {
  try {
    const response = await api.delete(`/api/v1/sports/${sportId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While deleting sport:', error.response?.data);
    throw new Error(error.response?.data?.message ?? 'Failed to delete sport');
  }
}

// Add with other interfaces at the top
export interface TeamSize {
  _id: string;
  name: number;
  // Add other team size properties if needed
}

// Get all team sizes
export async function getAllTeamSizes(): Promise<any> {
  try {
    const response = await api.get('/api/v1/team-sizes', {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While fetching team sizes:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to fetch team sizes',
    );
  }
}

// Create new team size
export async function createTeamSize(teamSizeData: any): Promise<any> {
  try {
    const response = await api.post('/api/v1/team-sizes', teamSizeData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While creating team size:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to create team size',
    );
  }
}

// Update team size
export async function updateTeamSize(
  teamSizeId: string,
  teamSizeData: any,
): Promise<any> {
  try {
    const response = await api.put(
      `/api/v1/team-sizes/${teamSizeId}`,
      teamSizeData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('While updating team size:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to update team size',
    );
  }
}

// Delete team size
export async function deleteTeamSize(teamSizeId: string): Promise<any> {
  try {
    const response = await api.delete(`/api/v1/team-sizes/${teamSizeId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error('While deleting team size:', error.response?.data);
    throw new Error(
      error.response?.data?.message ?? 'Failed to delete team size',
    );
  }
}
