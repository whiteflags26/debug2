export type RequestStatus =
  | "pending"
  | "processing"
  | "approved"
  | "approved_with_changes"
  | "rejected";

export interface IOrganizationRequest {
  _id: string;
  requesterId: string;
  status: RequestStatus;
  organizationName: string;
  facilities: string[];
  location: {
    place_id: string;
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    area?: string;
    sub_area?: string;
    city: string;
    post_code?: string;
  };
  contactPhone: string;
  ownerEmail: string;
  requestNotes?: string;
  adminNotes?: string;
  processingAdminId?: string;
  processingStartedAt?: Date;
  orgContactPhone: string;
  orgContactEmail: string;
  images: string[];
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}
