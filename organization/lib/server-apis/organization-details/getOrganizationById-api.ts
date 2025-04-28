export async function getOrganizationById(id: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/organizations/${id}`,
      {
        method: "GET",
        credentials: "include", // Important for sending cookies
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `Failed to fetch organization with ID ${id}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}