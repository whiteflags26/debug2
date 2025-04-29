"use client"
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import ProfileContent from "@/components/profile/ProfileContent";
import { useAuth } from "@/lib/contexts/authContext";
;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isLoading && !user) {
    router.push("/sign-in");
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <Suspense fallback={
          <div className="animate-pulse">
            <div className="bg-white rounded-xl shadow-lg p-8 h-64"></div>
            <div className="bg-white rounded-xl shadow-lg p-8 h-96 mt-8"></div>
          </div>
        }>
          {user && <ProfileContent initialUser={user} />}
        </Suspense>
      </div>
    </main>
  );
}