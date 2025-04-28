"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/authContext";

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: ReactNode;
  requireAdmin?: boolean;
}) {
  const { user, loading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuthenticated = await checkAuth();
      
      if (!isAuthenticated) {
        router.push("/admin/sign-in");
        return;
      }
      
      if (requireAdmin && !user?.isAdmin) {
        router.push("/unauthorized");
      }
    };

    if (!loading) {
      verifyAuth();
    }
  }, [loading, user, requireAdmin, router, checkAuth]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated or not admin when required, render nothing (will redirect)
  if (!user || (requireAdmin && !user.isAdmin)) {
    return null;
  }

  // Otherwise, render the protected content
  return <>{children}</>;
}