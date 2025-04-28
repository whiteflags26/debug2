import { cookies } from "next/headers";
import { IUser } from "@/types/user";

interface Session {
  user: IUser | null;
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore =await cookies();
    const token = cookieStore.get("token");

    if (!token) {
      return { user: null };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
      {
        headers: {
          Cookie: `token=${token.value}`,
        },
        credentials: "include",
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return { user: null };
    }

    const data = await response.json();
    return { user: data.data as IUser };
  } catch (error) {
    console.error("Auth error:", error);
    return { user: null };
  }
}
