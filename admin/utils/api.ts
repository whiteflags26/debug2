export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';
    const url = `${baseUrl}${endpoint}`;

    // Force POST requests to include proper headers and body handling
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {}),
      },
    };

    console.log('Request URL:', url); // Debug log
    console.log('Request Method:', finalOptions.method); // Debug log

    const response = await fetch(url, finalOptions);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error ?? 'Something went wrong',
      };
    }

    return data;
  } catch (error: any) {
    console.error('API Request Error:', error); // Debug log
    return {
      success: false,
      error: error.message ?? 'Something went wrong',
    };
  }
}
