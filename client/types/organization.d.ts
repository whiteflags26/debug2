import { ITurf } from "./turf.d.ts";
import { ILocation } from "./location.d.ts";

export interface CreateRequestDto {
  organizationName: string;
  facilities: string[];
  location: {
    place_id: string;
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
    area?: string;
    sub_area?: string;
    city: string;
    post_code?: string;
  };
  contactPhone: string;
  ownerEmail: string;
  requestNotes?: string;
  orgContactPhone: string;
  orgContactEmail: string;
}



export interface IOrganization {
  _id: string;
  name: string;
  facilities: string[];
  images: string[];
  turfs: ITurf[];
  location: ILocation;
  orgContactPhone: string;
  orgContactEmail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}