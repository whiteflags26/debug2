"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { sendResetPasswordRequest } from "@/lib/server-apis/authentication/password-api";
import { ApiError } from "@/types/api-error";
import toast from "react-hot-toast";

interface ResetPasswordFormData {
  newPassword: string;
  retypeNewPassword: string;
}

function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const userId = searchParams.get("id");
  const router = useRouter();

  const newPassword = watch("newPassword");

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token || !userId) {
      toast.error("Invalid or expired reset token.");
      return;
    }

    try {
      const response = await sendResetPasswordRequest(
        data.newPassword.trim(), // Trim password to remove accidental spaces
        token,
        userId
      );

      if (!response?.message) {
        throw new Error("Unexpected server response.");
      }

      toast.success(response.message);

      // Redirect to /sign-in after 2 seconds
      setTimeout(() => {
        router.push("/sign-in");
      }, 2000);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error?.message || "An error occurred. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded-3xl shadow-2xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-medium text-gray-900">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter your new password and confirm it to regain access.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* New Password Field */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="newPassword"
            autoComplete="new-password"
            {...register("newPassword", {
              required: "New password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm"
            placeholder="Enter your new password"
          />
          {errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Retype New Password Field */}
        <div>
          <label
            htmlFor="retypeNewPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Retype New Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="retypeNewPassword"
            autoComplete="new-password"
            {...register("retypeNewPassword", {
              required: "Please retype your new password",
              validate: (value) =>
                value.trim() === newPassword.trim() ||
                "Passwords do not match",
            })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm"
            placeholder="Re-type your new password"
          />
          {errors.retypeNewPassword && (
            <p className="mt-1 text-sm text-red-600">
              {errors.retypeNewPassword.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="default" className="w-full">
          Update Password
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <Suspense fallback={<div>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
