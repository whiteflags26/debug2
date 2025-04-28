export async function reverseGeocode(lat: string, lon: string) {
  try {
    const API_KEY = process.env.NEXT_PUBLIC_BARIKOI_API_KEY;
    const response = await fetch(
      `https://barikoi.xyz/v1/api/search/reverse/geocode/server/${API_KEY}/place?longitude=${lon}&latitude=${lat}&district=true&post_code=true&country=true&sub_district=true&union=true&pauroshova=true&location_type=true&division=true&address=true&area=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
}