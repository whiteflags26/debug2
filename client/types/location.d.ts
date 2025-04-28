export interface ILocation {
  place_id: string;
  address: string;
  coordinates: {
    type: string;
    coordinates: number[];
  };
  area: string;
  sub_area: string;
  city: string;
  post_code: string;
}
