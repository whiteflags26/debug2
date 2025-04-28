"use client";

import { IUser } from "@/types/user";
import { updateUserProfile } from "@/lib/server-apis/profile/updateUserProfile-api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiUser, FiPhone } from "react-icons/fi";
import { ApiError } from "@/types/api-error";
import { isBangladeshiPhone } from "@/lib/utils/phoneValidation";
import { Button } from "@/components/Button";

interface UpdateProfileFormProps {
  user: IUser | null;
  setUser: (user: IUser) => void;
}

export default function UpdateProfileForm({
  user,
  setUser,
}: UpdateProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number || "",
  });
  const [phoneError, setPhoneError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPhoneError("");

    if (formData.phone_number && !isBangladeshiPhone(formData.phone_number)) {
      setPhoneError("Please enter a valid Bangladeshi phone number");
      setLoading(false);
      return;
    }

    try {
      const updatedUser = await updateUserProfile(formData);
      setUser(updatedUser);
      toast.success("Profile updated successfully");
    } catch (err) {
      const error = err as ApiError;
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    first_name: e.target.value,
                  }))
                }
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="last_name"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiUser className="text-gray-400" />
              </div>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    last_name: e.target.value,
                  }))
                }
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                required
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="phone_number"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiPhone className="text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2.5 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                placeholder="+880 1XXX-XXXXXX"
              />
            </div>
            {phoneError && (
              <p className="text-red-500 text-sm mt-1">{phoneError}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Optional: Add your contact number
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} variant="default">
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating Profile...
              </>
            ) : (
              "Update Profile"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
