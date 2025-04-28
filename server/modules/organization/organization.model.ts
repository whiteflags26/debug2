import mongoose, { Document, Schema } from "mongoose";
import validator from 'validator';

interface ILocation {
  place_id: string; // Unique identifier from Barikoi
  address: string; // Full formatted address
  coordinates: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  area?: string;
  sub_area?: string;
  city: string;
  post_code?: string;
}

export interface IOrganization extends Document {
  name: string;
  facilities: string[];

  images: string[];
  turfs: mongoose.Types.ObjectId[];
  location: ILocation;

  orgContactPhone: string; // Mandatory
  orgContactEmail: string; // Mandatory
}

const OrganizationSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    facilities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    turfs: [{ type: Schema.Types.ObjectId, ref: "Turf" }],

  
    location: {
      place_id: { type: String, required: true },
      address: { type: String, required: true },
      coordinates: {
        type: {
          type: String,
          enum: ["Point"],
          required: true,
          default: "Point",
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: {
            validator: (value: number[]) => value.length === 2,
            message: "Coordinates must be an array of [longitude, latitude]",
          },
        },
      },
      area: String,
      sub_area: String,
      city: { type: String, required: true },
      post_code: String,
    },
    orgContactPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Bangladeshi phone number regex pattern
          const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
          return bdPhoneRegex.test(value);
        },
        message: "Please provide a valid Bangladeshi phone number",
      },
    },
    orgContactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
        message: "Please provide a valid email address",
      },
    },
  },
  { timestamps: true }
);

OrganizationSchema.index({ "location.coordinates": "2dsphere" });

const Organization = mongoose.model<IOrganization>(
  "Organization",
  OrganizationSchema
);

export default Organization;
