"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { sendForgotPasswordRequest } from "@/lib/server-apis/authentication/password-api";
import { ApiError } from "@/types/api-error";
import toast from "react-hot-toast";

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await sendForgotPasswordRequest(data.email);
      toast.success(response.message);
    } catch (err) {
      const error = err as ApiError;
      toast.error(
        error?.message || "An error occurred while processing your request."
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-md bg-white bg-opacity-90 p-8 rounded-3xl shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-medium text-gray-900">
              Forgot Your Password?
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Enter your email below and we’ll send you a link to reset your
              password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                {...register("email", { required: "Email is required" })}
                className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button type="submit" variant="default" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
