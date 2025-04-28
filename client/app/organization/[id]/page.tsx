"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  CalendarClock,
  Star,
  Users,
  Clock,
  CheckCircle,
  ExternalLink
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { IOrganization } from "@/types/organization";
import { IOrganizationTurfReviewSummary } from "@/types/organizationTurfReview";
import { fetchOrganization } from "@/lib/server-apis/organization/getOrganization-api";
import { fetchOrganizationTurfReviewSummary } from "@/lib/server-apis/organization/getOrganizationTurfReviewSummary-api";
import { generateBarikoiMapLink } from "@/lib/server-apis/barikoi/generateMap-api";

export default function OrganizationPage() {
  const { id } = useParams() as { id: string };
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [reviewSummary, setReviewSummary] =
    useState<IOrganizationTurfReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [orgData, reviewData] = await Promise.all([
          fetchOrganization(id),
          fetchOrganizationTurfReviewSummary(id),
        ]);

        if (!orgData) {
          throw new Error("Failed to load organization data");
        }

        setOrganization(orgData);
        setReviewSummary(reviewData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        console.error("Error fetching organization data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <OrganizationSkeleton />;
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Unable to load organization
        </h2>
        <p className="text-slate-600">{error || "Organization not found"}</p>
      </div>
    );
  }

  // Find a turf summary from the review data, with null check
  const findTurfSummary = (turfId: string) => {
    if (!reviewSummary || !reviewSummary.turfSummaries) return null;
    return reviewSummary.turfSummaries.find((t) => t.turfId === turfId) || null;
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Organization Header */}
        <header className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-600 to-green-400">
            {organization.images && organization.images.length > 0 ? (
              <Image
                src={organization.images[0]}
                alt={organization.name}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                priority
                className="object-cover opacity-90"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="w-20 h-20 text-white/50" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
              <div className="p-6 md:p-8 w-full">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {organization.name}
                </h1>
                <div className="flex items-center gap-3 text-white/90">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm md:text-base">
                    {organization.location?.address || "Address Unavailable"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Organization Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <Card className="overflow-hidden border-slate-200 hover:border-green-600 transition-all shadow-sm hover:shadow-md">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-xl text-slate-800 font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span>About {organization.name}</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Contact Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-slate-700">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>
                        {organization.orgContactPhone || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <Mail className="h-4 w-4 text-green-600" />
                      <span>
                        {organization.orgContactEmail || "Not provided"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700">
                      <CalendarClock className="h-4 w-4 text-green-600" />
                      <span>
                        Member since{" "}
                        {new Date(organization.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Location & Map Link */}
                  <div className="space-y-3">
                    {organization.location && (
                      <div className="flex items-start gap-3 text-slate-700">
                        <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                        <div>
                          <p>
                            {organization.location.address ||
                              "Address not available"}
                          </p>
                          <p className="text-sm text-slate-500">
                            {[
                              organization.location.area,
                              organization.location.sub_area,
                              organization.location.city,
                              organization.location.post_code,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {organization.location?.coordinates?.coordinates && (
                      <a
                        href={generateBarikoiMapLink(
                          organization.location.coordinates.coordinates[0],
                          organization.location.coordinates.coordinates[1]
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-700 ml-7 transition-colors"
                      >
                        View on map
                        <ExternalLink size="14px" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Facilities */}
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="mb-4 flex items-center text-slate-700 font-medium">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />{" "}
                    Available Facilities
                  </h3>

                  {organization.facilities &&
                  organization.facilities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {organization.facilities.map((facility) => (
                        <Badge
                          key={facility}
                          variant="outline"
                          className="border-green-300 text-slate-700 text-sm hover:bg-green-50 px-3 py-1 rounded-full transition"
                        >
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">
                      No facilities listed.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Turfs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-green-600" />
                  Available Turfs
                </h2>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {organization.turfs?.length || 0} Turfs
                </Badge>
              </div>

              {organization.turfs && organization.turfs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {organization.turfs.map((turf) => {
                    const turfSummary = findTurfSummary(turf._id);

                    return (
                      <motion.div
                        key={turf._id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="overflow-hidden border-slate-200 hover:border-green-600 transition-colors shadow-sm hover:shadow-md h-full">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between">
                              <h3 className="text-lg font-medium text-slate-800">
                                {turf.name}
                              </h3>

                              {/* Rating from review summary if available */}
                              {turfSummary &&
                                typeof turfSummary.averageRating ===
                                  "number" && (
                                  <div className="flex items-center gap-1 text-amber-500">
                                    <Star className="h-4 w-4 fill-amber-500 stroke-amber-500" />
                                    <span className="font-medium">
                                      {turfSummary.averageRating.toFixed(1)}
                                    </span>
                                  </div>
                                )}
                            </div>

                            <div className="flex items-center text-green-600">
                              <span className="mr-1 text-xl font-bold">৳</span>
                              <span className="font-semibold">
                                {typeof turf.basePrice === "number"
                                  ? turf.basePrice.toFixed(2)
                                  : "N/A"}
                              </span>
                              <span className="text-sm text-slate-500 ml-1">
                                /hour
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {turf.sports &&
                                turf.sports.map((sport) => (
                                  <Badge
                                    key={sport}
                                    variant="secondary"
                                    className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-md"
                                  >
                                    {sport}
                                  </Badge>
                                ))}
                              {typeof turf.team_size === "number" && (
                                <Badge
                                  variant="secondary"
                                  className="bg-slate-50 text-slate-600 text-xs px-2 py-0.5 rounded-md"
                                >
                                  {turf.team_size}v{turf.team_size}
                                </Badge>
                              )}
                            </div>

                            <div className="flex justify-end pt-2">
                              <a
                                href={`/venues/${turf._id}`}
                                className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors flex items-center gap-1"
                              >
                                View Details
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="lucide lucide-arrow-right"
                                >
                                  <path d="M5 12h14" />
                                  <path d="m12 5 7 7-7 7" />
                                </svg>
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-500">
                  No turfs available for this organization.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Review Summary and Operating Hours */}
          <div className="space-y-8">
            {/* Review Summary Card */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-xl text-slate-800 font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span>Ratings & Reviews</span>
                </h2>

                {reviewSummary &&
                typeof reviewSummary.overallAverageRating === "number" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center bg-slate-50 p-4 rounded-lg space-x-3">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-slate-800">
                          {reviewSummary.overallAverageRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-slate-500">
                          {reviewSummary.totalReviewCount || 0} reviews
                        </div>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <=
                              Math.round(reviewSummary.overallAverageRating)
                                ? "fill-amber-500 stroke-amber-500"
                                : "stroke-slate-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {reviewSummary.turfSummaries &&
                      reviewSummary.turfSummaries.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-medium text-slate-700">
                            Turf Ratings
                          </h3>
                          {reviewSummary.turfSummaries.map((turfSummary) => (
                            <div
                              key={turfSummary.turfId}
                              className="flex items-center justify-between border-b border-slate-100 pb-2"
                            >
                              <span className="text-sm text-slate-700">
                                {turfSummary.turfName}
                              </span>
                              <div className="flex items-center">
                                <Star className="h-4 w-4 fill-amber-500 stroke-amber-500 mr-1" />
                                <span className="text-sm font-medium">
                                  {typeof turfSummary.averageRating === "number"
                                    ? turfSummary.averageRating.toFixed(1)
                                    : "-"}
                                </span>
                                <span className="text-xs text-slate-500 ml-1">
                                  ({turfSummary.reviewCount || 0})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No reviews available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours Card */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="text-xl text-slate-800 font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span>Operating Hours</span>
                </h2>

                {organization.turfs &&
                organization.turfs.length > 0 &&
                organization.turfs[0].operatingHours &&
                organization.turfs[0].operatingHours.length > 0 ? (
                  <Tabs defaultValue="turf-0" className="w-full">
                    <TabsList className="grid grid-cols-2 mb-4">
                      {organization.turfs.slice(0, 2).map((turf, index) => (
                        <TabsTrigger
                          key={turf._id}
                          value={`turf-${index}`}
                          className="text-xs sm:text-sm"
                        >
                          {turf.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {organization.turfs.slice(0, 2).map((turf, turfIndex) => (
                      <TabsContent
                        key={turf._id}
                        value={`turf-${turfIndex}`}
                        className="space-y-3"
                      >
                        {turf.operatingHours &&
                          turf.operatingHours.map((hour, hourIndex) => (
                            <div
                              key={hourIndex}
                              className="flex items-center justify-between text-sm text-slate-700"
                            >
                              <span className="font-medium">
                                {
                                  [
                                    "Sunday",
                                    "Monday",
                                    "Tuesday",
                                    "Wednesday",
                                    "Thursday",
                                    "Friday",
                                    "Saturday",
                                  ][hour.day]
                                }
                              </span>
                              <span className="font-mono">
                                {hour.open} - {hour.close}
                              </span>
                            </div>
                          ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500">
                      No operating hours available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Loading skeleton
function OrganizationSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 space-y-10">
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          <Skeleton className="h-48 md:h-64 w-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6 space-y-6">
                <Skeleton className="h-7 w-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-4 w-4 mt-1" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-28 ml-7" />
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-20 rounded-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Turfs Skeleton */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <Skeleton className="h-6 w-36" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                      <div className="flex flex-wrap gap-2">
                        {[1, 2].map((j) => (
                          <Skeleton key={j} className="h-5 w-16 rounded-md" />
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="space-y-8">
            <Card>
              <CardContent className="p-6 space-y-5">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-4">
                  <div className="flex items-center justify-center bg-slate-50 p-4 rounded-lg space-x-3">
                    <Skeleton className="h-16 w-16" />
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-5 w-5 mx-0.5" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-24" />
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-slate-100 pb-2"
                      >
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-5">
                <Skeleton className="h-7 w-40" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full mb-4" />
                  {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
