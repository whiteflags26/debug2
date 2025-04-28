import mongoose, { Document, Schema } from "mongoose";

export interface IFacility extends Document {
  name: string;
}

const FacilitySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const Facility = mongoose.model<IFacility>("Facility", FacilitySchema);