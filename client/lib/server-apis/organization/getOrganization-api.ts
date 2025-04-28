import { IOrganization } from "@/types/organization";

export async function fetchOrganization(organizationId: string): Promise<IOrganization | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${organizationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch organization");
    }

    const data = await response.json();

    // Check if the response has the expected structure
    if (data.success && data.data) {
      return data.data;
    }

    // If response is directly the organization data
    if (data._id) {
      return data;
    }

    return null;
  } catch (error) {
    console.error("Fetch organization error:", error);
    return null;
  }
}