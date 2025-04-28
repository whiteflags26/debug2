export interface ITurf {
  _id: string;
  name: string;
  basePrice: number;
  sports: string[];
  team_size: number;
  images: string[];
  mainImage?: string;
  size?: string;
  operatingHours: Array<{
    day: number;
    open: string;
    close: string;
  }>;
  organization: {
    _id: string;
    name: string;
    facilities: string[];
    location: {
      address: string;
      city: string;
      coordinates: [number, number];
    };
    createdAt?: string;
    updatedAt?: string;
  };
}