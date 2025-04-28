import { IOrganizationRequest } from "@/types/organizationRequest";

export async function getUserOrganizationRequests(): Promise<IOrganizationRequest[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/organization-requests/user`,
      {
        method: "GET",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch organization requests");
    }

    return data.data as IOrganizationRequest[];
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}