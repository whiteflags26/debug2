import { ITurfReview } from "@/types/turf-review";

export async function fetchReviewsByUser(userId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/user/${userId}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to fetch user reviews");
    const json = await res.json();
    return json.data.reviews as ITurfReview[];
  } catch (error) {
    console.error(error);
    return [];
  }
}
