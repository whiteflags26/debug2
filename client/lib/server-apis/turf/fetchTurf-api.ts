import { ITurfFilters } from "@/types/turfFilter";
import { IPagination } from "@/types/pagination";

export async function fetchTurfs(
  filters: ITurfFilters,
  pagination: IPagination
) {
  const params = new URLSearchParams();

  if (filters?.minPrice && filters.minPrice !== "")
    params.append("minPrice", filters.minPrice.toString());

  if (filters?.maxPrice && filters.maxPrice !== "")
    params.append("maxPrice", filters.maxPrice.toString());

  if (
    filters?.teamSize &&
    Array.isArray(filters.teamSize) &&
    filters.teamSize.length > 0
  ) {
    filters.teamSize.forEach((size) => {
      if (size) params.append("teamSize", size.toString());
    });
  }

  if (
    filters?.facilities &&
    Array.isArray(filters.facilities) &&
    filters.facilities.length > 0
  ) {
    filters.facilities.forEach((f) => {
      if (f) params.append("facilities", f.toString());
    });
  }

  if (filters?.radius && filters.radius !== "")
    params.append("radius", filters.radius.toString());

  if (filters?.latitude && filters.latitude !== "")
    params.append("latitude", filters.latitude.toString());

  if (filters?.longitude && filters.longitude !== "")
    params.append("longitude", filters.longitude.toString());

  if (
    filters?.sports &&
    Array.isArray(filters.sports) &&
    filters.sports.length > 0
  ) {
    filters.sports.forEach((sport) => {
      if (sport) params.append("sports", sport.toString());
    });
  }

  if (filters?.preferredDate && filters.preferredDate !== "")
    params.append("preferredDate", filters.preferredDate.toString());

  if (filters?.preferredTimeStart && filters.preferredTimeStart !== "")
    params.append("preferredTimeStart", filters.preferredTimeStart.toString());

  if (filters?.preferredTimeEnd && filters.preferredTimeEnd !== "")
    params.append("preferredTimeEnd", filters.preferredTimeEnd.toString());

  if (pagination?.currentPage)
    params.append("page", pagination.currentPage.toString());

  if (pagination?.limit) params.append("limit", pagination.limit.toString());

  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_API_URL
    }/api/v1/turf/filter/search?${params.toString()}`
  );

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to fetch turfs");
  }

  const data = await res.json();
  return data;
}
