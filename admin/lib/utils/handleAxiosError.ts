import axios from 'axios';

export function handleAxiosError(error: unknown, fallbackMessage = 'An error occurred'): string {
  if (axios.isAxiosError(error)) {
    // Handle specific status codes
    if (error.response?.status === 403) {
      return error.response.data?.message || 'You are not authorized to perform this action';
    }
    if (error.response?.status === 401) {
      return 'Please login to continue';
    }
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 400) {
      return error.response.data?.message || 'Invalid request';
    }
    if (error.response?.status === 500) {
      return 'Server error, please try again later';
    }

    // Return the error message from the response if it exists
    return error.response?.data?.message || error.response?.data || fallbackMessage;
  } 
  
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}