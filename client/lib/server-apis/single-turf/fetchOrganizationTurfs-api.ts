import { ITurf } from "@/types/turf";

/**
 * Fetches other turfs from the same organization, excluding a specific turf.
 * @param organizationId The ID of the organization
 * @param excludeTurfId The ID of the turf to exclude from the results
 * @returns A promise resolving to an array of ITurf objects or null on error.
 */
export async function fetchOrganizationTurfs(
  organizationId: string,
  excludeTurfId: string
): Promise<ITurf[] | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${organizationId}/other-turfs/${excludeTurfId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(
        "Failed to fetch other organization turfs:",
        error.message || "Unknown error"
      );
      return null;
    }

    const result = await response.json();

    console.log(result);

    return result.data as ITurf[];
  } catch (error) {
    console.error("Fetch other organization turfs error:", error);
    return null;
  }
}
