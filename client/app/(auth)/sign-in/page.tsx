"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/contexts/authContext";
import { ApiError } from "@/types/api-error";

interface SignInFormData {
  email: string;
  password: string;
}

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth(); // Get login function from AuthContext

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);

      // Use login function from AuthContext instead of direct fetch
      await login(data.email, data.password);

      toast.success("Welcome back!");
      reset(); // Clear form
      router.push("/");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "Failed to sign in");
    } finally {
      setIsLoading(false);
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
              Welcome Back!
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              Sign in to continue booking your perfect sports field.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                {...register("password", {
                  required: "Password is required",
                })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right text-sm mt-2">
              <Link
                href="/forgot-password"
                className="text-gray-600 font-medium hover:text-green-700 underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Footer Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="text-gray-600 font-medium hover:text-green-700 underline"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      <footer className="absolute bottom-4 w-full text-center text-sm text-gray-500">
        © {new Date().getFullYear()} TurfMania. All Rights Reserved.
      </footer>
    </div>
  );
}
