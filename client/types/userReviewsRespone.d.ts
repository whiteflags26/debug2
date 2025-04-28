import { ITurfReview } from "@/types/turf-review";

export interface IUserReviewsResponse {
  reviews: ITurfReview[];
  averageRating: number;
  ratingDistribution: { [key: string]: number };
  total: number;
}