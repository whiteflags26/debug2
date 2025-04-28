import mongoose, { Document, Schema } from "mongoose";

export interface ISports extends Document {
  name: string;
}

const SportsSchema: Schema = new Schema(
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

export const Sports = mongoose.model<ISports>("Sports", SportsSchema);