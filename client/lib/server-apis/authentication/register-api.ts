export async function registerUser(data: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Important for cookies
      body: JSON.stringify({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message ?? "Something went wrong");
  }

  return result;
}
