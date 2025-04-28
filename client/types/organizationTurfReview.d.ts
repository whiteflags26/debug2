export interface ITurfReviewSummary {
    turfId: string;
    turfName: string;
    averageRating: number;
    reviewCount: number;
    reviewDistribution: {
      [rating: string]: number; // e.g., "1": 5, "2": 10, etc.
    };
  }
  
  export interface IOrganizationTurfReviewSummary {
    organizationId: string;
    organizationName: string;
    overallAverageRating: number;
    totalReviewCount: number;
    turfSummaries: ITurfReviewSummary[];
  }
  interface TurfReviewData {
    _id: string;
    name: string;
    averageRating: number;
    reviewCount: number;
  }