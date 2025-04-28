// organization-request.model.ts (Updated)
import mongoose, { Document, Schema, Types } from "mongoose";

export type RequestStatus = "pending" | "processing" | "approved" | "approved_with_changes" | "rejected";

export interface IOrganizationRequest extends Document {
  requesterId: Types.ObjectId; // Reference to User model
  status: RequestStatus;

  // Organization Data
  organizationName: string;
  facilities: string[];
  location: {
    place_id: string;
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
    area?: string;
    sub_area?: string;
    city: string;
    post_code?: string;
  };

  // Contact Information
  contactPhone: string; // Mandatory

  // Owner Information
  ownerEmail: string; // Mandatory - must exist in user database

  // Additional Request Fields
  requestNotes?: string; // User's notes/explanation for the request
  adminNotes?: string; // Admin's notes (especially for rejections)
  processingAdminId?: Types.ObjectId; // Which admin is processing this request
  processingStartedAt?: Date; // When processing began
  orgContactPhone: string; // Mandatory organization contact phone
  orgContactEmail: string; // Mandatory organization contact email

  // Images (Cloudinary URLs)
  images: string[];

  // Result data
  organizationId?: Types.ObjectId; // Reference to created organization (if approved)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationRequestSchema: Schema = new Schema(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "approved", "approved_with_changes", "rejected"],
      default: "pending",
    },

    // Organization Data
    organizationName: {
      type: String,
      required: true,
      trim: true,
    },
    facilities: {
      type: [String],
      required: true,
      validate: {
        validator: (value: string[]) => value.length > 0,
        message: "At least one facility is required",
      },
    },
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

    // Contact Information
    contactPhone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Bangladeshi phone number regex pattern
          const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
          return bdPhoneRegex.test(value);
        },
        message:
          "Please provide a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678)",
      },
    },

    // Owner Information
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Please provide a valid owner email address",
      },
    },

    // Additional Request Fields
    requestNotes: {
      type: String,
      trim: true,
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    processingAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processingStartedAt: {
      type: Date,
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
        message: "Please provide a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678)",
      },
    },
    orgContactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
        },
        message: "Please provide a valid organization contact email address",
      },
    },

    // Images (Cloudinary URLs)
    images: {
      type: [String],
      default: [],
    },

    // Result data
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

// Index for efficient lookups
OrganizationRequestSchema.index({ status: 1, createdAt: -1 });
OrganizationRequestSchema.index({ requesterId: 1 });
OrganizationRequestSchema.index({ processingAdminId: 1 });
OrganizationRequestSchema.index({ "location.coordinates": "2dsphere" });
OrganizationRequestSchema.index({ ownerEmail: 1 });

const OrganizationRequest = mongoose.model<IOrganizationRequest>(
  "OrganizationRequest",
  OrganizationRequestSchema
);

export default OrganizationRequest;