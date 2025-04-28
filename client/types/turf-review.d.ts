import { ITurf } from "./turf";

export interface ITurfReview {
  _id: string;
  turf: ITurf;
  user: {
    _id: string;
    first_name: string;
    last_name: string;
    email: string;
    isVerified: boolean;
  };
  rating: number;
  review?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateReviewData {
  rating?: number;
  review?: string;
  images?: File[];
  existingImages?: string[];
}
