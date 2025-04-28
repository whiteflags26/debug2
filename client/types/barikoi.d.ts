export interface IBarikoiSuggestion {
  id: number;
  longitude: string;
  latitude: string;
  address: string;
  city: string;
  area: string;
  postCode?: number;
  pType?: string;
}

export interface IBarikoiAutocompleteResponse {
  places: IBarikoiSuggestion[];
  status: number;
}