export interface ISuggestion {
  _id: string;
  name: string;
  type: "turf" | "organization";
  location?: string;
  sport?: string;
}

export interface ISearchResult {
  _id: string;
  name: string;
  basePrice?: number;
  sports?: string[];
  team_size?: number[];
  images?: string[];
  organization: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
    };
  };
}

export interface SearchPagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}
