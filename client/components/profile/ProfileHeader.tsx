import { IUser } from "@/types/user";
import Image from "next/image";
import { FaPhone, FaEnvelope } from "react-icons/fa";
import { DEFAULT_AVATAR_IMAGE } from "@/constants";
import { resendVerificationEmail } from "@/lib/server-apis/profile/resendVerificationEmail";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ApiError } from "@/types/api-error";
interface ProfileHeaderProps {
  user: IUser | null;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isResending, setIsResending] = useState(false);

  if (!user) return null;

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const response = await resendVerificationEmail(user.email);
      toast.success(response.message);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col sm:flex-row items-center gap-8">
        <div className="relative w-36 h-36 sm:w-44 sm:h-44">
          <Image
            src={DEFAULT_AVATAR_IMAGE}
            alt={`${user.first_name} ${user.last_name}`}
            fill
            sizes="(max-width: 640px) 64px, 96px"
            priority
            className="rounded-full object-cover border-4 border-primary/20 shadow-md"
          />
        </div>
        <div className="flex-1 text-center sm:text-left space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{`${user.first_name} ${user.last_name}`}</h1>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 text-gray-600 items-center sm:items-start">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-primary" />
                <span>{user.email}</span>
              </div>
              {user.phone_number && (
                <div className="flex items-center gap-2">
                  <FaPhone className="text-primary" />
                  <span>{user.phone_number}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                {user.isVerified ? "Verified User" : "Pending Verification"}
              </span>
              {!user.isVerified && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? "Sending..." : "Resend Verification"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
