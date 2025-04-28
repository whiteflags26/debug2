import { IUserReviewsResponse } from "@/types/userReviewsRespone";

export async function getUserReviews(): Promise<IUserReviewsResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/user`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch user reviews");
    }

    return {
      reviews: data.data.reviews,
      averageRating: data.data.averageRating,
      ratingDistribution: data.data.ratingDistribution,
      total: data.meta.total,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}
