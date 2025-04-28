import { CreateRequestDto } from '@/types/organization';

type FacilityResponse = {
  success: boolean;
  count: number;
  data: Array<{
    _id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
};

export async function getFacilities(): Promise<{
  ok: boolean;
  data: string[] | { message: string };
}> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error(
        'API URL is not defined. Check your environment variables.',
      );
    }

    const response = await fetch(`${apiUrl}/api/v1/facilities`, {
      method: 'GET',
      credentials: 'include',
    });

    const result = (await response.json()) as FacilityResponse;

    if (!response.ok) {
      throw new Error('Failed to fetch facilities');
    }

    // Extract only the facility names
    const facilityNames = result.data.map(facility => facility.name);

    return {
      ok: true,
      data: facilityNames,
    };
  } catch (error) {
    console.error('Failed to fetch facilities:', error);
    return {
      ok: false,
      data: {
        message:
          error instanceof Error ? error.message : 'Failed to fetch facilities',
      },
    };
  }
}

export async function createOrganizationRequest(
  data: CreateRequestDto,
  imageFiles?: File[],
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error(
        'API URL is not defined. Check your environment variables.',
      );
    }

    // If we have image files, use FormData
    if (imageFiles && imageFiles.length > 0) {
      const formData = new FormData();

      // Add ALL required fields
      formData.append('organizationName', data.organizationName);
      formData.append('facilities', JSON.stringify(data.facilities));
      formData.append('contactPhone', data.contactPhone);
      formData.append('ownerEmail', data.ownerEmail);
      formData.append('location', JSON.stringify(data.location));
      formData.append('orgContactPhone', data.orgContactPhone);
      formData.append('orgContactEmail', data.orgContactEmail);

      if (data.requestNotes) {
        formData.append('requestNotes', data.requestNotes);
      }

      // Add images
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${apiUrl}/api/v1/organization-requests`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const result = await response.json();

      return {
        ok: response.ok,
        data: result,
      };
    }
    // No images, use JSON
    else {
      const response = await fetch(`${apiUrl}/api/v1/organization-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      return {
        ok: response.ok,
        data: result,
      };
    }
  } catch (error) {
    console.error('API request failed:', error);
    return {
      ok: false,
      data: {
        message:
          error instanceof Error
            ? error.message
            : 'Failed to connect to the server',
      },
    };
  }
}
