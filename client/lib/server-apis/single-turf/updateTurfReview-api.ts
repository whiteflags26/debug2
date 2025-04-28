import { UpdateReviewData } from "@/types/turf-review";

export async function updateTurfReview(
  reviewId: string,
  data: UpdateReviewData
) {
  try {
    const formData = new FormData();
    
    if (data.rating) {
      formData.append('rating', data.rating.toString());
    }
    
    if (data.review) {
      formData.append('review', data.review);
    }
    
    if (data.images) {
      data.images.forEach(image => {
        formData.append('images', image);
      });
    }

    if (data.existingImages) {
      data.existingImages.forEach(image => {
        formData.append('existingImages', image);
      });
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/review/${reviewId}`,
      {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update review');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Update review error:', error);
    throw error;
  }
}
