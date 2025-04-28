import { ITurf } from "@/types/turf";

export async function fetchTurfReviewSummary(turfs: ITurf[]) {
  const summaries: {
    [turfId: string]: { averageRating: number; reviewCount: number };
  } = {};

  await Promise.all(
    turfs.map(async (turf) => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/turf-summary/${turf._id}`
        );
        const json = await res.json();
        summaries[turf._id] = json.data || { averageRating: 0, reviewCount: 0 };
      } catch {
        summaries[turf._id] = { averageRating: 0, reviewCount: 0 };
      }
    })
  );

  return summaries;
}