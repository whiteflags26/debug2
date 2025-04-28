"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { ITurfReview } from "@/types/turf-review";
import { IUser } from "@/types/user";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchReviewsByTurfPublic } from "@/lib/server-apis/single-turf/fetchReviewsByTurfPublic-api";
import { fetchReviewsByTurf } from "@/lib/server-apis/single-turf/fetchReviewsByTurf-api";
import ReviewForm from "@/components/single-turf/ReviewForm";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";
import ReviewActionsDropdown from "@/components/single-turf/ReviewActionsDropdown";
import { updateTurfReview } from "@/lib/server-apis/single-turf/updateTurfReview-api";
import { deleteTurfReview } from "@/lib/server-apis/single-turf/deleteTurfReview-api";
import { UpdateReviewData } from "@/types/turf-review";
import { hasUserReviewedTurf } from "@/lib/server-apis/single-turf/hasUserReviewedTurf-api";
import { toast } from "react-hot-toast";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

interface ReviewSectionProps {
  turfId: string;
  currentUser: IUser | null;
}

interface ReviewData {
  reviews: ITurfReview[];
  averageRating: number;
  ratingDistribution: { [key: string]: number };
  pagination: {
    total: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}

interface ImageModalProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

const ImageModal = ({ src, alt, isOpen, onClose }: ImageModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogTitle className="sr-only">Review Image Preview</DialogTitle>
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="80vw"
            className="object-contain"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function ReviewSection({
  turfId,
  currentUser,
}: ReviewSectionProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    reviews: [],
    averageRating: 0,
    ratingDistribution: {},
    pagination: {
      total: 0,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
  });
  const [sortBy, setSortBy] = useState("latest");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [ratingRange, setRatingRange] = useState([1, 5]);
  const [isFiltered, setIsFiltered] = useState(false);
  const router = useRouter();

  // Convert rating distribution to chart data
  const distributionData = Object.entries(reviewData.ratingDistribution)
    .map(([star, count]) => ({
      star: Number(star),
      count: Number(count),
    }))
    .sort((a, b) => b.star - a.star);

  const loadReviews = async () => {
    try {
      const options = {
        page: reviewData.pagination.currentPage,
        limit: 10,
        sortBy:
          sortBy === "latest"
            ? "createdAt"
            : sortBy === "oldest"
            ? "createdAt"
            : "rating",
        sortOrder:
          sortBy === "oldest"
            ? ("asc" as const)
            : sortBy === "lowest"
            ? ("asc" as const)
            : ("desc" as const),
        minRating: ratingRange[0],
        maxRating: ratingRange[1],
      };

      // Use different API based on authentication status
      const data = currentUser
        ? await fetchReviewsByTurf(turfId, options)
        : await fetchReviewsByTurfPublic(turfId, options);

      setReviewData(data);

      if (currentUser) {
        const reviewed = await hasUserReviewedTurf(turfId);
        setHasReviewed(reviewed);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    loadReviews();
    setIsFiltered(
      sortBy !== "latest" || ratingRange[0] !== 1 || ratingRange[1] !== 5
    );
  }, [turfId, sortBy, ratingRange, reviewData.pagination.currentPage]);

  useEffect(() => {
    const checkReviewStatus = async () => {
      if (currentUser) {
        const reviewed = await hasUserReviewedTurf(turfId);
        setHasReviewed(reviewed);
      }
    };

    checkReviewStatus();
  }, [currentUser, turfId]);

  const handlePageChange = (newPage: number) => {
    setReviewData((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: newPage },
    }));
  };

  const handleReviewClick = () => {
    if (hasReviewed) {
      toast.error(
        "You have already reviewed this turf. You can edit or delete your existing review to submit a new one."
      );
      return;
    }
  };

  const clearFilters = () => {
    setSortBy("latest");
    setRatingRange([1, 5]);
    setIsFiltered(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header with Add Review Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">
          Reviews & Ratings
        </h2>
        {currentUser ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="rounded-xl"
                onClick={handleReviewClick}
                disabled={hasReviewed}
              >
                {hasReviewed ? "Already Reviewed" : "Add Your Review"}
              </Button>
            </DialogTrigger>
            {!hasReviewed && (
              <DialogContent>
                <ReviewForm turfId={turfId} onSuccess={loadReviews} />
              </DialogContent>
            )}
          </Dialog>
        ) : (
          <Button onClick={() => router.push("/sign-in")}>
            Sign in to Review
          </Button>
        )}
      </div>

      {/* Rating Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-slate-900 mb-2">
                {reviewData.averageRating.toFixed(1)}
              </p>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(reviewData.averageRating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500">
                Based on {reviewData.pagination.total} reviews
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-slate-200">
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distributionData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="star"
                  tick={{ fontSize: 14, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 14, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                  contentStyle={{
                    background: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    padding: "8px 12px",
                  }}
                  content={({ payload, label }) => (
                    <div className="text-sm">
                      <p className="font-medium text-slate-700">
                        {label} Stars
                      </p>
                      <p className="text-slate-600">
                        {payload?.[0]?.value || 0} Reviews
                      </p>
                    </div>
                  )}
                />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  barSize={32}
                  animationDuration={1000}
                  animationBegin={200}
                  onMouseEnter={(data, index) => {
                    const chart = document.querySelector(
                      `#bar-${index}`
                    ) as HTMLElement;
                    if (chart) {
                      chart.style.filter = "brightness(1.1)";
                      chart.style.cursor = "pointer";
                    }
                  }}
                  onMouseLeave={(data, index) => {
                    const chart = document.querySelector(
                      `#bar-${index}`
                    ) as HTMLElement;
                    if (chart) {
                      chart.style.filter = "none";
                    }
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Header Section with Rating Range and Clear Filters */}
            <div className="flex flex-col sm:flex-row items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-slate-400" />
                <h3 className="text-base font-semibold text-slate-700">
                  Filter & Sort Reviews
                </h3>
              </div>

              <div className="w-full sm:w-64 space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-medium text-slate-600">
                    Rating Range
                  </Label>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-full">
                    {ratingRange[0]} - {ratingRange[1]} ★
                  </span>
                </div>
                <DualRangeSlider
                  min={1}
                  max={5}
                  step={1}
                  value={ratingRange}
                  onValueChange={setRatingRange}
                  className="w-full h-2.5"
                />
              </div>
            </div>

            {/* Bottom Section - Sort Options and Clear Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-slate-600">
                    Sort:
                  </Label>
                  <select
                    className="px-3 py-1.5 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 transition-colors"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="latest">Latest Reviews</option>
                    <option value="oldest">Oldest Reviews</option>
                    <option value="highest">Highest Rated</option>
                    <option value="lowest">Lowest Rated</option>
                  </select>
                </div>
              </div>

              {isFiltered && (
                <Button variant="destructive" onClick={clearFilters} size="sm">
                  <span className="flex items-center gap-1.5">
                    Clear
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
                    >
                      <path d="M19 6L5 20M5 6l14 14" />
                    </svg>
                  </span>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {reviewData.reviews.length === 0 ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="text-slate-600">No reviews found.</p>
              </CardContent>
            </Card>
          ) : (
            reviewData.reviews.map((review) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-slate-200 hover:border-green-600 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {review.user?.first_name} {review.user?.last_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <ReviewActionsDropdown
                          review={review}
                          currentUser={currentUser}
                          onDelete={async () => {
                            await deleteTurfReview(review._id);
                            setHasReviewed(false); // Reset review status immediately
                            await loadReviews(); // Reload reviews
                          }}
                          onEdit={async (data: UpdateReviewData) =>
                            await updateTurfReview(review._id, data)
                          }
                          onReload={loadReviews}
                        />
                      </div>
                    </div>
                    {review.review && (
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {review.review}
                      </p>
                    )}
                    {review.images && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 max-w-[400px]">
                        {review.images.map((img, i) => (
                          <div
                            key={i}
                            className="relative w-[80px] h-[80px] cursor-pointer rounded-md overflow-hidden group"
                            onClick={() => setSelectedImage(img)}
                          >
                            <Image
                              src={img}
                              alt={`Review image ${i + 1}`}
                              fill
                              sizes="80px"
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Image Modal */}
      {selectedImage && (
        <ImageModal
          src={selectedImage}
          alt="Review image"
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Pagination */}
      {reviewData.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: reviewData.pagination.totalPages }, (_, i) => (
            <Button
              key={i}
              variant={
                reviewData.pagination.currentPage === i + 1
                  ? "default"
                  : "outline"
              }
              className={
                reviewData.pagination.currentPage === i + 1
                  ? "bg-green-600 hover:bg-green-700"
                  : "hover:border-green-600 hover:text-green-600"
              }
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
