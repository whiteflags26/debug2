"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { verifyEmail } from "@/lib/server-apis/authentication/verifyEmail-api";
import { ApiError } from "@/types/api-error";

const VerifyEmailPage = () => {
  const router = useRouter();
  const [message, setMessage] = useState("Verifying your email...");
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Extract the token and user ID from the URL query parameters
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    const userId = queryParams.get("id");

    if (!token || !userId) {
      setMessage("Invalid verification link.");
      return;
    }

    // Send a request to the backend to verify the email
    const verifyUserEmail = async () => {
      try {
        await verifyEmail(token, userId);
        setMessage("Your email has been verified successfully!");
        setIsVerified(true);
      } catch (err) {
        const error = err as ApiError;
        setMessage(
          error.message ?? "An error occurred. Please try again later."
        );
      }
    };

    verifyUserEmail();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
        <p className="text-gray-700 mb-6">{message}</p>
        {isVerified && (
          <Button
            variant="success"
            size="default"
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
