import { ITurf } from "@/types/turf";
export async function fetchTurfs(): Promise<ITurf[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch turfs");
    }

    const data = await response.json();

    // Handle different response structures
    if (Array.isArray(data)) {
      return data;
    }

    if (data.turfs && Array.isArray(data.turfs)) {
      return data.turfs;
    }

    // Fallback to empty array
    return [];
  } catch (error) {
    console.error("Fetch turfs error:", error);
    return [];
  }
}
