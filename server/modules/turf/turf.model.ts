import mongoose, { Document, Schema } from "mongoose";

export interface ITurf extends Document {
  organization: mongoose.Types.ObjectId;
  name: string;
  basePrice: number;
  sports: string[];
  team_size: number;
  images: string[];
  operatingHours: {
    day: number; // 0-6 (Sunday-Saturday)
    open: string; // "09:00"
    close: string; // "22:00"
  }[];
  reviews: mongoose.Types.ObjectId[];
}

const TurfSchema: Schema = new Schema(
  {
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      get: (v: number) => parseFloat(v.toFixed(2)),
      set: (v: number) => parseFloat(v.toFixed(2)),
    },
    sports: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        "At least one sport must be specified",
      ],
    },
    team_size: {
      type: Number,
      required: true,
      min: 1,
    },
    images: {
      type: [String],
      default: [],
    },
    operatingHours: [
      {
        day: {
          type: Number,
          required: true,
          min: 0,
          max: 6,
        },
        open: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        close: {
          type: String,
          required: true,
          match: /^([01]\d|2[0-3]):([0-5]\d)$/,
        },
        _id: false,
      },
    ],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "TurfReview",
      },
    ],
  },
  { timestamps: true }
);

TurfSchema.index(
  { name: 1, organization: 1 }, 
  { unique: true }
);

export const Turf = mongoose.model<ITurf>("Turf", TurfSchema);
