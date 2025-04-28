export async function createTurfReview(formData: FormData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/review`,
      {
        method: "POST",
        credentials: "include", // Important for sending cookies
        body: formData, // Send as FormData for file upload support
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create review");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}