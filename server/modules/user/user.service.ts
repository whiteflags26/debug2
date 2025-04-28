import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import ErrorResponse from "../../utils/errorResponse";
import User, { UserDocument } from "./user.model";
import { sendEmail } from "../../utils/email";
import UserRoleAssignment from "../role_assignment/userRoleAssignment.model";
import { PermissionScope } from "../permission/permission.model";

class UserService {
  /**
   * Get all users
   * @returns Promise<UserDocument[]> - Array of users
   */
  public async getAllUsersAdmin(): Promise<UserDocument[]> {
    try {
      const users = await User.find().select({
        password: 0,
      });

      return users;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to fetch users",
        error.statusCode ?? 500
      );
    }
  }

  /**
   * Get user by ID
   * @param userId - The ID of the user
   * @returns Promise<UserDocument> - User document
   */
  public async getUserByIdAdmin(userId: string): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ErrorResponse("Invalid User ID", 400);
      }

      const user = await User.findById(userId).select({
        password: 0,
        verificationToken: 0,
        verificationTokenExpires: 0,
      });

      if (!user) {
        throw new ErrorResponse("User not found", 404);
      }

      return user;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to fetch user",
        error.statusCode ?? 500
      );
    }
  }

  /**
   * Get current user profile
   * @param userId - The ID of the logged in user
   * @returns Promise<UserDocument> - User profile
   */
  public async getCurrentUserProfile(userId: string): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ErrorResponse("Invalid User ID", 400);
      }

      const user = await User.findById(userId)
        .select("-password -verificationToken -verificationTokenExpires")
        .populate({
          path: "reviews",
          select: "rating review createdAt turf",
          populate: {
            path: "turf",
            select: "name location",
          },
        });

      if (!user) {
        throw new ErrorResponse("User not found", 404);
      }

      return user;
    } catch (error: any) {
      console.error("Error fetching user profile:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to fetch user profile",
        error.statusCode ?? 500
      );
    }
  }

  /**
   * Update user profile
   * @param userId - The ID of the logged in user
   * @param updateData - Data to update (first_name, last_name, phone_number)
   * @returns Promise<UserDocument> - Updated user profile
   */
  public async updateUserProfile(
    userId: string,
    updateData: Partial<
      Pick<UserDocument, "first_name" | "last_name" | "phone_number">
    >
  ): Promise<UserDocument> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ErrorResponse("Invalid User ID", 400);
      }

      // Explicitly check allowed fields
      const allowedFields = ["first_name", "last_name", "phone_number"];
      const invalidFields = Object.keys(updateData).filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        throw new ErrorResponse(
          `Invalid fields for update: ${invalidFields.join(
            ", "
          )}. Only first_name, last_name, and phone_number can be updated.`,
          400
        );
      }

      // Handle empty phone number by removing it
      const updateQuery: mongoose.UpdateQuery<UserDocument> = {
        $set: { ...updateData },
      };

      if (updateData.phone_number === "") {
        delete updateQuery.$set.phone_number;
        updateQuery.$unset = { phone_number: 1 };
      }

      const user = await User.findByIdAndUpdate(userId, updateQuery, {
        new: true,
        runValidators: true,
      }).select("-password -verificationToken -verificationTokenExpires");

      if (!user) {
        throw new ErrorResponse("User not found", 404);
      }

      return user;
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to update user profile",
        error.statusCode ?? 500
      );
    }
  }

  /**
   * Change user password after verifying current password
   * @param userId - The ID of the user
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   */
  public async changeUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findById(userId).select("+password");
      if (!user) {
        throw new ErrorResponse("User not found", 404);
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new ErrorResponse("Current password is incorrect", 401);
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Send confirmation email
      await sendEmail(
        user.email,
        "Password Change Successful",
        "Your password has been successfully changed. If you did not perform this action, please contact support immediately."
      );

      return { success: true, message: "Password changed successfully" };
    } catch (error: any) {
      console.error("Error changing password:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to change password",
        error.statusCode ?? 500
      );
    }
  }

  /**
   * Get all organizations where the user has a role
   * @param userId - The ID of the logged in user
   * @returns Promise<Array> - List of organizations
   */
  public async getUserOrganizations(userId: string): Promise<any[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ErrorResponse("Invalid User ID", 400);
      }

      // Find all role assignments for this user with ORGANIZATION scope
      const userRoleAssignments = await UserRoleAssignment.find({
        userId,
        scope: PermissionScope.ORGANIZATION
      })
      .populate({
        path: "scopeId",
        model: "Organization",
        select: "name" 
      })
      .lean();

      // Extract organizations and filter out any undefined/null values
      const organizations = userRoleAssignments
        .filter(assignment => assignment.scopeId !== null && assignment.scopeId !== undefined)
        .map(assignment => assignment.scopeId);

      // Remove duplicate organizations using a Map with string IDs as keys
      const uniqueOrganizationsMap = new Map();
      organizations.forEach(org => {
        if (org && org._id) {
          uniqueOrganizationsMap.set(org._id.toString(), org);
        }
      });

      const uniqueOrganizations = Array.from(uniqueOrganizationsMap.values());

      return uniqueOrganizations;
    } catch (error: any) {
      console.error("Error fetching user organizations:", error);
      throw new ErrorResponse(
        error.message ?? "Failed to fetch organizations",
        error.statusCode ?? 500
      );
    }
  }
}

export const userService = new UserService();
