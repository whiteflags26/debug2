import { IUser } from "@/types/user";

interface UpdateProfileData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
}

export async function updateUserProfile(
  updateData: UpdateProfileData
): Promise<IUser> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(updateData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile");
    }

    return data.data as IUser;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}
