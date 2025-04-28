import { IOrganizationTurfReviewSummary } from "@/types/organizationTurfReview";
import { TurfReviewData } from "@/types/organizationTurfReview";

export async function fetchOrganizationTurfReviewSummary(
  organizationId: string
): Promise<IOrganizationTurfReviewSummary | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/organization-summary/${organizationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || "Failed to fetch organization turf review summary"
      );
    }

    const data = await response.json();

    // Check if the response has the expected structure
    if (data.success && data.data) {
      // Transform the data to match the expected interface
      const transformedData: IOrganizationTurfReviewSummary = {
        organizationId: organizationId,
        organizationName: "", 
        overallAverageRating: data.data.summary.organizationAverageRating,
        totalReviewCount: data.data.summary.totalReviews,
        turfSummaries: data.data.turfs.map((turf: TurfReviewData) => ({
          turfId: turf._id,
          turfName: turf.name,
          averageRating: turf.averageRating,
          reviewCount: turf.reviewCount,
          reviewDistribution: {},
        })),
      };

      return transformedData;
    }

    // If response is directly the summary data
    if (data.organizationId || data.overallAverageRating !== undefined) {
      return data;
    }

    return null;
  } catch (error) {
    console.error("Fetch organization turf review summary error:", error);
    return null;
  }
}
