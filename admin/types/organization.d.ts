import { User } from "@/component/admin/users/types";

export interface RequesterInfo {
  _id: string;
  email: string;
  name: string;
}

export interface Location {
  coordinates: {
    type: string;
    coordinates: number[];
  };
  place_id: string;
  address: string;
  city: string;
  area?: string;
  sub_area?: string;
  post_code?: string;
}

export interface Organization {
  _id?: string;
  organizationName: string;
  location: Location;
  facilities: string[];
  images?: string[];
  turfs?: string[];
  orgContactPhone: string;
  orgContactEmail: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface OrganizationRequest {
  _id: string;
  organizationName: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'approved_with_changes';
  location: Location;
  requesterId: User;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  ownerEmail: string;
  contactPhone: string;
  requestNotes?: string;
  processingAdminId?: User;
  processingStartedAt?: string;
  organizationId?: Organization;
  // Add any missing fields from your backend response here
}

export interface OrganizationRequestsResponse {
  success: boolean;
  data: {
    requests: OrganizationRequest[];
    page: number;
    pages: number;
    total: number;
  };
  meta: {
    total: number;
    page: number;
    pages: number;
    filters: Record<string, unknown>;
  };
}

export interface SingleOrganizationRequestResponse {
  success: boolean;
  data: OrganizationRequest;
  message?: string;
}

export interface OrganizationResponse {
  success: boolean;
  data: Organization | Organization[];
}



export interface Coordinates {
  type: "Point";
  coordinates: [number, number];
}

export interface Location {
  coordinates: Coordinates;
  place_id: string;
  address: string;
  city: string;
}

export type RequestStatus = "pending" | "processing" | "approved" | "approved_with_changes" | "rejected";

export interface OrganizationRequest {
  _id: string;
  requesterId: string;
  processingAdminId?: string;
  status: RequestStatus;
  organizationName: string;
  facilities: string[];
  contactPhone: string;
  ownerEmail: string;
  requestNotes?: string;
  orgContactPhone: string;
  orgContactEmail: string;
  images: string[];
  location: Location;
  createdAt: string;
  updatedAt: string;
  processingStartedAt?: string;
}
