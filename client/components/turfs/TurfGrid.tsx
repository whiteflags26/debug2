import { ITurf } from "@/types/turf";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Users, Clock, Search, Star } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchTurfReviewSummary } from "@/lib/server-apis/single-turf/fetchTurfReviewSummary-api";
import { IPagination } from "@/types/pagination";
import { ITurfFilters } from "@/types/turfFilter";
import Link from "next/link";

interface Props {
  loading: boolean;
  turfs: ITurf[];
  filters: ITurfFilters;
  pagination: IPagination;
  selectedTurf: ITurf | null;
  setSelectedTurf: Dispatch<SetStateAction<ITurf | null>>;
  resetFilters: () => void;
}

interface TurfReviewSummary {
  [turfId: string]: {
    averageRating: number;
    reviewCount: number;
  };
}

export default function TurfGrid({ loading, turfs, resetFilters }: Props) {
  const [reviewSummaries, setReviewSummaries] = useState<TurfReviewSummary>({});

  useEffect(() => {
    const fetchSummaries = async () => {
      const summaries = await fetchTurfReviewSummary(turfs);
      setReviewSummaries(summaries);
    };

    if (!loading && turfs.length > 0) {
      fetchSummaries();
    }
  }, [turfs, loading]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {loading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-9 w-24 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))
      ) : turfs.length === 0 ? (
        <div className="col-span-3 py-16 text-center">
          <div className="mx-auto w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-medium text-slate-700 mb-2">
            No turfs found
          </h3>
          <p className="text-slate-500 mb-6">
            Try adjusting your filters or search criteria
          </p>
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      ) : (
        turfs.map((turf) => {
          const summary = reviewSummaries[turf._id] || {
            averageRating: 0,
            reviewCount: 0,
          };

          return (
            <motion.div
              key={turf._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Link href={`/venues/${turf._id}`} className="h-full block">
                <Card className="overflow-hidden h-full flex flex-col border-slate-200 hover:border-green-600 transition-all hover:shadow-lg hover:shadow-green-100">
                  <div className="relative h-64 bg-slate-100">
                    {turf.images.length > 0 ? (
                      <Image
                        src={turf.images[0] || "/placeholder.svg"}
                        fill
                        className="object-cover transition-transform hover:scale-105"
                        alt={turf.name}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400">
                        <Search size={24} />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4 flex-grow">
                    <h3 className="text-xl font-semibold mb-1 text-slate-800 truncate">
                      {turf.name}
                    </h3>

                    <p className="text-sm text-slate-500 mb-1 truncate">
                      By {turf.organization?.name || "Unknown Org"}
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                      <Star size={16} className="text-yellow-400" />
                      <span className="text-sm text-slate-700 font-medium">
                        {summary.averageRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({summary.reviewCount} reviews)
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mb-3 text-slate-600">
                      <MapPin
                        size={14}
                        className="text-green-600 flex-shrink-0"
                      />
                      <span className="text-sm truncate">
                        {turf.organization?.location?.address ||
                          "No address available"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {turf.sports.slice(0, 3).map((sport) => (
                        <Badge
                          key={sport}
                          variant="secondary"
                          className="bg-green-50 text-green-600"
                        >
                          {sport}
                        </Badge>
                      ))}
                      {turf.sports.length > 3 && (
                        <Badge variant="outline">
                          +{turf.sports.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-slate-400" />
                        <span>
                          {turf.team_size}v{turf.team_size}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        <span>
                          {turf.operatingHours[0]?.open} -{" "}
                          {turf.operatingHours[0]?.close}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0 mt-auto">
                    <div className="flex justify-between items-center w-full">
                      <p className="text-2xl font-bold text-green-600">
                        ৳{turf.basePrice}
                        <span className="text-sm text-slate-500">/hour</span>
                      </p>
                      <Button variant="default">View Details</Button>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          );
        })
      )}
    </div>
  );
}