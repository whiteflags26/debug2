"use client";

import { useState, useEffect } from "react";
import { getUserReviews } from "@/lib/server-apis/profile/getUserReviews-api";
import { StarIcon } from "@heroicons/react/20/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { IUserReviewsResponse } from "@/types/userReviewsRespone";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ReviewsSection() {
  const [data, setData] = useState<IUserReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await getUserReviews();
        setData(response);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error("Failed to load reviews");
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-8 bg-gray-200 rounded-lg w-24 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded-lg w-32 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-48"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <StarIconOutline className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          Failed to load reviews
        </h3>
        <p className="mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  if (!data?.reviews.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <StarIconOutline className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">No reviews</h3>
        <p className="mt-1 text-gray-500">
          You haven&#39;t reviewed any turfs yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{data.total}</p>
            <p className="text-sm text-gray-500 mt-1">Total Reviews</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <p className="text-3xl font-bold text-gray-900">
                {data.averageRating.toFixed(1)}
              </p>
              <StarIcon className="h-7 w-7 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-500 mt-1">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[5,4,3,2,1].map(rating => ({
                  star: rating,
                  count: data.ratingDistribution[rating] || 0
                }))}>
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
                        <p className="font-medium text-slate-700">{label} Stars</p>
                        <p className="text-slate-600">{payload?.[0]?.value || 0} Reviews</p>
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
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-gray-500 mt-2">Rating Distribution</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {data.reviews.map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="space-y-1">
                <Link
                  href={`/venues/${review.turf._id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-primary"
                >
                  {review.turf.name}
                </Link>
                <p className="text-sm text-gray-500">
                  {review.turf.organization.name} •{" "}
                  {format(new Date(review.createdAt), "MMM dd, yyyy")}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full self-start">
                <span className="text-lg font-semibold text-yellow-700">
                  {review.rating}
                </span>
                <StarIcon className="h-5 w-5 text-yellow-400" />
              </div>
            </div>

            {review.review && (
              <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                {review.review}
              </p>
            )}

            {review.images && review.images.length > 0 && (
              <div className="mt-4 flex gap-3 overflow-x-auto py-2">
                {review.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden ring-1 ring-black/5"
                  >
                    <Image
                      src={image}
                      alt={`Review image ${index + 1}`}
                      fill
                      className="object-cover hover:opacity-90 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
