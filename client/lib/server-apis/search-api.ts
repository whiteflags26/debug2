import { ISuggestion, ISearchResult, SearchPagination } from "@/types/search";

/**
 * Fetch search suggestions
 * @param query Search query string
 * @returns Array of search suggestions
 */
export const fetchSuggestions = async (
  query: string
): Promise<ISuggestion[]> => {
  if (query.trim().length < 2) {
    return [];
  }

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/v1/search/suggestions?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch suggestions");
    }

    const data = await response.json();
    if (data.success && data.data) {
      return data.data;
    }
    return [];
  } catch (error) {
    console.error("Search suggestion error:", error);
    return [];
  }
};

/**
 * Fetch search results
 * @param query Search query string
 * @param page Page number for pagination
 * @returns Object containing search results and pagination info
 */
export const fetchSearchResults = async (
  query: string,
  page = 1
): Promise<{
  results: ISearchResult[];
  pagination: SearchPagination;
} | null> => {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL
      }/api/v1/search?query=${encodeURIComponent(query)}&page=${page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch search results");
    }

    const data = await response.json();
    if (data.success && data.data) {
      return {
        results: data.data.results,
        pagination: data.data.pagination,
      };
    }
    return null;
  } catch (error) {
    console.error("Search results error:", error);
    return null;
  }
};
