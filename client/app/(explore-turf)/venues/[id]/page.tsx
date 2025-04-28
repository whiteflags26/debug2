import { ITurf } from "@/types/turf";
import { fetchSingleTurf } from "@/lib/server-apis/single-turf/single-turf-api";
import { fetchOrganizationTurfs } from "@/lib/server-apis/single-turf/fetchOrganizationTurfs-api";
import TurfImageSlider from "@/components/single-turf/TurfImageSlider";
import TurfDetails from "@/components/single-turf/TurfDetails";
import OtherOrganizationTurfs from "@/components/single-turf/OtherOrganizationTurfs";
import ReviewSection from "@/components/single-turf/ReviewRating";
import BookingButton from "@/components/booking/BookingButton";
import { notFound } from "next/navigation";
import { auth } from "@/lib/server-auth/auth";
import { Card } from "@/components/ui/card";

interface SingleTurfPageProps {
  params: Promise<{ id: string }>;
}

export default async function SingleTurfPage({ params }: SingleTurfPageProps) {
  const { id: turfId } = await params;
  const session = await auth();
  const currentUser = session?.user || null;

  // Fetch data
  const turf: ITurf | null = await fetchSingleTurf(turfId);
  if (!turf) notFound();

  const organizationId = turf.organization?._id;
  const otherTurfs: ITurf[] = organizationId
    ? (await fetchOrganizationTurfs(organizationId, turfId)) || []
    : [];

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
            <ReviewSection turfId={turfId} currentUser={currentUser} />
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
