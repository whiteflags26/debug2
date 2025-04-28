"use client";

import { useState, useEffect } from "react";
import { Tab } from "@headlessui/react";
import { IUser } from "@/types/user";
import { getCurrentUserProfile } from "@/lib/server-apis/profile/getCurrentUserProfile-api";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  PencilSquareIcon,
  LockClosedIcon,
  StarIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

import ProfileHeader from "@/components/profile/ProfileHeader";
import UpdateProfileForm from "@/components/profile/UpdateProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import ReviewsSection from "@/components/profile/ReviewsSection";
import OrganizationRequestsSection from "@/components/profile/OrganizationRequestsSection";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface ProfileContentProps {
  initialUser: IUser;
}

export default function ProfileContent({ initialUser }: ProfileContentProps) {
  const [user, setUser] = useState<IUser | null>(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserProfile() {
      setLoading(true);
      try {
        const userData = await getCurrentUserProfile();
        setUser(userData);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error("Failed to load complete profile data");
      } finally {
        setLoading(false);
      }
    }
    fetchUserProfile();
    // Only fetch if we need additional user data
    // if (initialUser && !initialUser.phone_number) {
    //   fetchUserProfile();
    // }
  }, [initialUser]);

  const tabs = [
    {
      name: "Profile",
      icon: UserIcon,
      component: () => <UpdateProfileForm user={user} setUser={setUser} />,
    },
    {
      name: "Password",
      icon: LockClosedIcon,
      component: () => <ChangePasswordForm />,
    },
    { name: "Reviews", icon: StarIcon, component: () => <ReviewsSection /> },
    {
      name: "Organizations",
      icon: BuildingOfficeIcon,
      component: () => <OrganizationRequestsSection />,
    },
  ];

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <PencilSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          Error loading profile
        </h3>
        <p className="mt-1 text-gray-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Profile Header */}
      <ProfileHeader user={user} />

      {/* Tabs Section */}
      <div className="bg-white rounded-xl shadow-lg p-1 sm:p-2">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    "flex items-center gap-2 w-full rounded-lg py-2.5 text-sm font-medium leading-5",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-primary focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white text-primary shadow"
                      : "text-gray-600 hover:bg-white/[0.12] hover:text-primary"
                  )
                }
              >
                <tab.icon className="h-5 w-5 mx-auto sm:mx-0" />
                <span className="hidden sm:inline">{tab.name}</span>
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-2 p-4">
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className={classNames("rounded-xl focus:outline-none")}
              >
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-64 bg-gray-100 rounded-xl"></div>
                  </div>
                ) : (
                  tab.component()
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </>
  );
}
