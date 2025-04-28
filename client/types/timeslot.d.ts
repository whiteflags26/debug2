import { Types } from "mongoose";

export interface ITimeSlot {
  _id: string;
  turf: string | Types.ObjectId;
  start_time: string | Date;
  end_time: string | Date;
  is_available: boolean;
  price_override?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}
