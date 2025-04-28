import bcrypt from "bcryptjs";
import mongoose, { Types, Document, Schema } from "mongoose";

export interface IRoleAssignment {
  role: Types.ObjectId;
}

export interface UserDocument extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  isVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  reviews: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<UserDocument>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, minlength: 6, select: false, required: true },
    phone_number: {
      type: String,
      validate: {
        validator: function (value: string) {
          if (!value) return true; // Skip validation if value is empty
          const bdPhoneRegex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
          return bdPhoneRegex.test(value);
        },
        message:
          "Please provide a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678)",
      },
    },

    isVerified: { type: Boolean, default: false }, // Default to false
    verificationToken: { type: String }, // Token for email verification
    verificationTokenExpires: { type: Date },
    // Token expiration time

    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "TurfReview",
      },
    ],
  },
  { timestamps: true }
);

// hash the password before creating the database
UserSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User =
  mongoose.models.User ?? mongoose.model<UserDocument>("User", UserSchema);

export default User;
