import { ObjectId } from "mongoose";

export interface IUser {
  _id: string; 
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: string; // ISO date string
  reviews: ObjectId[] | string[]; // Depending on population
  createdAt: string;
  updatedAt: string;
}
