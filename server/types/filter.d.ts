export interface FilterOptions {
  minPrice?: string;
  maxPrice?: string;
  teamSize?: string;
  sports?: string | string[];
  facilities?: string | string[];
  preferredDate?: string;
  preferredTimeStart?: string;
  preferredTimeEnd?: string;
  latitude?: string;
  longitude?: string;
  radius?: string;
  page?: string;
  limit?: string;
}
