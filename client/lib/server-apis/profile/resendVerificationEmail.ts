import { IResendVerificationResponse } from "@/types/resendVerificationEmail";

export async function resendVerificationEmail(
  email: string
): Promise<IResendVerificationResponse> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resend-verification`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend verification email");
    }

    return {
      success: data.success,
      message: data.message,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
}
