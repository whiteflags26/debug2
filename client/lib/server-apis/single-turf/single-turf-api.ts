import { ITurf } from "@/types/turf";

export async function fetchSingleTurf(id: string): Promise<ITurf | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch turf");
    }

    const { data } = await response.json();

    return data as ITurf;
  } catch (error) {
    console.error("Fetch single turf error:", error);
    return null;
  }
}
