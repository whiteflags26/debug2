"use client";
import { ITurf } from "@/types/turf";
import { fetchSingleTurf } from "@/lib/server-apis/single-turf/single-turf-api";
import { fetchOrganizationTurfs } from "@/lib/server-apis/single-turf/fetchOrganizationTurfs-api";
import TurfImageSlider from "@/components/single-turf/TurfImageSlider";
import TurfDetails from "@/components/single-turf/TurfDetails";
import OtherOrganizationTurfs from "@/components/single-turf/OtherOrganizationTurfs";
import ReviewSection from "@/components/single-turf/ReviewRating";
import BookingButton from "@/components/booking/BookingButton";
import { notFound, useParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/authContext";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function SingleTurfPage() {
  const { user } = useAuth();
  const params = useParams();
  const turfId = params.id as string;

  const [turf, setTurf] = useState<ITurf | null>(null);
  const [otherTurfs, setOtherTurfs] = useState<ITurf[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch turf data
        const turfData = await fetchSingleTurf(turfId);
        if (!turfData) {
          notFound();
          return;
        }
        setTurf(turfData);

        // Fetch other turfs from the same organization
        const organizationId = turfData.organization?._id;
        if (organizationId) {
          const orgTurfs = await fetchOrganizationTurfs(organizationId, turfId);
          if (orgTurfs) {
            setOtherTurfs(orgTurfs);
          }
        }
      } catch (error) {
        console.error("Error fetching turf data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (turfId) {
      fetchData();
    }
  }, [turfId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading turf details...</p>
        </div>
      </div>
    );
  }

  if (!turf) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="w-full bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto py-6">
            {turf.images && turf.images.length > 0 && (
              <TurfImageSlider images={turf.images} />
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 space-y-8">
            <TurfDetails turf={turf} />
            <ReviewSection turfId={turfId} currentUser={user} />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              {otherTurfs.length > 0 && (
                <Card className="p-4 bg-white">
                  <OtherOrganizationTurfs
                    turfs={otherTurfs}
                    currentTurfId={turfId}
                  />
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Floating Booking Button */}
      <BookingButton turfId={turfId} />
    </div>
  );
}