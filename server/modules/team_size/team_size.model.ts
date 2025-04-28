import mongoose, { Document, Schema } from "mongoose";

export interface ITeamSize extends Document {
  name: number; 
}

const TeamSizeSchema: Schema = new Schema(
  {
    name: {
      type: Number,
      required: true,
      min: 1,
      unique: true,
    },
  },
  { timestamps: true }
);

export const TeamSize = mongoose.model<ITeamSize>("TeamSize", TeamSizeSchema);