import { ITurfStatusResponse } from "@/types/turf-status-response";

export async function getTurfStatus(
  turfId: string
): Promise<ITurfStatusResponse> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf/${turfId}/status`,
      {
        cache: "no-store", // Disable caching to get real-time status
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch turf status");
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching turf status:", error);
    // Return a default closed status in case of error
    return {
      isOpen: false,
      status: "CLOSED",
      message: "Unable to fetch turf status",
    };
  }
}
