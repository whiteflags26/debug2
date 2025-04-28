export async function sendForgotPasswordRequest(email: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) throw new Error("Failed to send reset email.");
  return response.json();
}

export async function sendResetPasswordRequest(
  password: string,
  token: string,
  userId: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password?token=${token}&id=${userId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password}),
    }
  );

  if (!response.ok) throw new Error("Failed to reset password.");
  return response.json();
}