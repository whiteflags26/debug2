"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/contexts/authContext";
import { ApiError } from "@/types/api-error";
import { getUserOrganizations } from "@/lib/server-apis/organization-list/getUserOrganizations-api";
import { FiMail, FiLock, FiArrowRight, FiCheckCircle, FiUser, FiInfo } from "react-icons/fi";

interface SignInFormData {
  email: string;
  password: string;
}

interface Organization {
  _id: string;
  name: string;
}

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInFormData>();

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      await login(data.email, data.password);
      const orgResponse = await getUserOrganizations();
      if (orgResponse.success && orgResponse.data.length > 0) {
        setOrganizations(orgResponse.data);
        setShowOrgModal(true);
      } else {
        toast.error("No organizations found for this user");
      }
      reset();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSelect = (orgId: string) => {
    setSelectedOrg(orgId);
    setTimeout(() => {
      setShowOrgModal(false);
      toast.success("Welcome back!");
      router.push(`/organization/${orgId}`);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col relative overflow-hidden">
      <div className="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl backdrop-blur-sm bg-opacity-95"
        >
          <div className="text-center mb-8">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <FiUser size={26} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Sign in to access your TurfMania dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
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
                  className={`block w-full rounded-lg border pl-10 px-4 py-3 shadow-sm transition duration-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="your.email@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiInfo className="mr-1" size={14} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  {...register("password", { required: "Password is required" })}
                  className={`block w-full rounded-lg border pl-10 px-4 py-3 shadow-sm transition duration-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                    errors.password ? "border-red-300 bg-red-50" : "border-gray-300"
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiInfo className="mr-1" size={14} />
                  {errors.password.message}
                </p>
              )}
            </div>

           

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-3xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 font-medium flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Organization Selection Modal */}
      <AnimatePresence>
        {showOrgModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 mr-4">
                  <FiCheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Select Organization</h2>
                  <p className="text-gray-500 text-sm">Choose an organization to continue</p>
                </div>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {organizations.map((org) => (
                  <motion.button
                    key={org._id}
                    onClick={() => handleOrganizationSelect(org._id)}
                    className={`w-full text-left p-4 border rounded-xl transition-all flex items-center ${
                      selectedOrg === org._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="font-semibold text-blue-700">
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium text-gray-800">{org.name}</p>
                      
                    </div>
                    {selectedOrg === org._id && (
                      <FiCheckCircle className="h-5 w-5 text-blue-600 ml-2" />
                    )}
                  </motion.button>
                ))}
              </div>

              <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: #f1f1f1;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: #c5c5c5;
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #a3a3a3;
                }
              `}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="w-full text-center text-sm text-gray-500 py-6 relative z-10">
        © {new Date().getFullYear()} TurfMania. All Rights Reserved.
      </footer>
    </div>
  );
}
