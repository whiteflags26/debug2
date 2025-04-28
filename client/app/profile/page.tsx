import { auth } from "@/lib/server-auth/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import ProfileContent from "@/components/profile/ProfileContent";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
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
          <ProfileContent initialUser={session.user} />
        </Suspense>
      </div>
    </main>
  );
}