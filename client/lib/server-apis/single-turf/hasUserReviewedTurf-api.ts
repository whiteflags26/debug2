export async function hasUserReviewedTurf(turfId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/turf-review/has-reviewed/${turfId}`,
      {
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check review status');
    }

    const data = await response.json();
    return data.data.hasReviewed;
  } catch (error) {
    console.error('Error checking review status:', error);
    return false;
  }
}