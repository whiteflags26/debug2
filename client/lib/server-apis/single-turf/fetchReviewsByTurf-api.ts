import { ITurfReview } from "@/types/turf-review";

interface FetchReviewsOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minRating?: number;
  maxRating?: number;
}

export async function fetchReviewsByTurf(
  turfId: string,
  options: FetchReviewsOptions = {}
) {
  try {
    const params = new URLSearchParams();

    // Add all possible query parameters
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.minRating) params.append('minRating', options.minRating.toString());
    if (options.maxRating) params.append('maxRating', options.maxRating.toString());

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/turf/${turfId}?${params.toString()}`,
      { 
        credentials: 'include', // Important for sending auth cookies
        cache: "no-store"
      }
    );

    if (!res.ok) throw new Error("Failed to fetch reviews");
    
    const json = await res.json();
    
    return {
      reviews: json.data.reviews as ITurfReview[],
      averageRating: json.data.averageRating,
      ratingDistribution: json.data.ratingDistribution,
      pagination: {
        total: json.meta.total,
        currentPage: json.meta.page || 1,
        totalPages: json.meta.pages || 1,
        limit: json.meta.limit || 10
      }
    };
  } catch (error) {
    console.error(error);
    return {
      reviews: [],
      averageRating: 0,
      ratingDistribution: {},
      pagination: {
        total: 0,
        currentPage: 1,
        totalPages: 1,
        limit: 10
      }
    };
  }
}