import { ITurfReview, TurfReview } from "./turf-review.model";
import { Turf } from "../turf/turf.model";
import User from "../user/user.model";
import mongoose from "mongoose";
import { uploadImage, deleteImage } from "../../utils/cloudinary";
import { extractPublicIdFromUrl } from "../../utils/extractUrl";
import ErrorResponse from '../../utils/errorResponse';


interface CreateReviewData {
  turfId: string;
  userId: string;
  rating: number;
  review?: string;
  images?: Express.Multer.File[];
}

interface UpdateReviewData {
  rating?: number;
  review?: string;
  images?: Express.Multer.File[];
}

export interface ReviewFilterOptions {
  turfId?: string;
  userId?: string;
  minRating?: number;
  maxRating?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ReviewSummary {
  reviews: ITurfReview[];
  total: number;
  averageRating: number;
  ratingDistribution: { [rating: number]: number };
}


export default class TurfReviewService {
  // Create a new review
  async createReview(data: CreateReviewData): Promise<ITurfReview> {
    // Check if user exists and is verified
    const user = await User.findById(data.userId);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }
    if (!user.isVerified) {
      throw new ErrorResponse("User must be verified to create a review", 403);
    }

    const turfExists = await Turf.exists({ _id: data.turfId });
    if (!turfExists) {
      throw new ErrorResponse("Turf not found", 404);
    }

    const existingReview = await TurfReview.findOne({
      turf: data.turfId,
      user: data.userId,
    });

    if (existingReview) {
      throw new ErrorResponse("User has already reviewed this turf", 400);
    }

    // Upload images if provided
    let imageUrls: string[] = [];
    if (data.images && data.images.length > 0) {
      try {
        const uploadPromises = data.images.map((image) => uploadImage(image));
        const uploadedImages = await Promise.all(uploadPromises);
        imageUrls = uploadedImages.map((img) => img.url);
      } catch (error) {
        throw new ErrorResponse("Failed to upload images", 500);
      }
    }

    try {
      const turfReview = new TurfReview({
        turf: data.turfId,
        user: data.userId,
        rating: data.rating,
        review: data.review,
        images: imageUrls,
      });

      const newReview = await turfReview.save();

      // Update the User document
      await User.findByIdAndUpdate(data.userId, {
        $push: { reviews: newReview._id },
      });

      // Update the Turf document
      await Turf.findByIdAndUpdate(data.turfId, {
        $push: { reviews: newReview._id },
      });

      return newReview;
    } catch (error) {
      throw new ErrorResponse("Failed to create review", 500);
    }
  }

  // Update an existing review
  async updateReview(
    reviewId: string,
    userId: string,
    data: UpdateReviewData
  ): Promise<ITurfReview | null> {
    // Check if user is verified
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse("User not found", 404);
    }
    if (!user.isVerified) {
      throw new ErrorResponse("User must be verified to update a review", 403);
    }

    const review = await TurfReview.findOne({
      _id: reviewId,
      user: userId,
    });

    if (!review) {
      throw new ErrorResponse("Review not found or user not authorized", 404);
    }

    let newImageUrls: string[] | undefined;

    // Handle image updates
    if (data.images && data.images.length > 0) {
      try {
        // Upload new images
        const uploadPromises = data.images.map((image) => uploadImage(image));
        const uploadedImages = await Promise.all(uploadPromises);
        newImageUrls = uploadedImages.map((img) => img.url);

        // Delete old images if they exist
        if (review.images && review.images.length > 0) {
          await Promise.all(
            review.images.map((imgUrl) => {
              const publicId = extractPublicIdFromUrl(imgUrl);
              return publicId ? deleteImage(publicId) : Promise.resolve();
            })
          );
        }
      } catch (error) {
        throw new ErrorResponse("Failed to update images", 500);
      }
    }

    // Prepare update payload
    const updatePayload: any = {
      rating: data.rating,
      review: data.review,
    };

    if (newImageUrls) {
      updatePayload.images = newImageUrls;
    }

    try {
      // Update the review
      const updatedReview = await TurfReview.findByIdAndUpdate(
        reviewId,
        { $set: updatePayload },
        { new: true, runValidators: true }
      );

      if (!updatedReview) {
        throw new ErrorResponse("Failed to update review", 500);
      }

      return updatedReview;
    } catch (error) {
      throw new ErrorResponse("Failed to update review", 500);
    }
  }

  // Delete a review
  async deleteReview(reviewId: string, userId: string): Promise<boolean> {
    const review = await TurfReview.findById(reviewId);

    if (!review) {
      throw new Error("Review not found");
    }
    if (review.user.toString() !== userId) {
      throw new Error("You are not authorized to delete this review");
    }

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      await Promise.all(
        review.images.map(async (imageUrl) => {
          const publicId = extractPublicIdFromUrl(imageUrl);
          if (publicId) {
            await deleteImage(publicId);
          }
        })
      );
    }

    await review.deleteOne();

    // Update the User document
    await User.findByIdAndUpdate(userId, {
      $pull: { reviews: reviewId },
    });

    // Update the Turf document
    await Turf.findByIdAndUpdate(review.turf, {
      $pull: { reviews: reviewId },
    });

    return true;
  }

  // Get all reviews for a specific turf and their average rating and rating distribution
  async getReviewsByTurf(
    turfId: string,
    options: ReviewFilterOptions = {},
    requestingUserId?: string // Add parameter for requesting user
  ): Promise<ReviewSummary> {
    const filter = { turf: turfId };
    const matchStage = { turf: new mongoose.Types.ObjectId(turfId) };

    // Use the extracted common method
    return this.getReviewsWithStats(
      filter,
      matchStage,
      {
        populateField: "user",
        populateSelect: "_id first_name last_name email isVerified",
      },
      options,
      requestingUserId
    );
  }

  // Common method for retrieving reviews with stats
  private async getReviewsWithStats(
    filter: any,
    matchStage: any,
    populateOptions: { populateField: string; populateSelect: string },
    options: ReviewFilterOptions = {},
    requestingUserId?: string
  ): Promise<ReviewSummary> {
    // Apply rating filters
    this.applyRatingFilters(filter, matchStage, options);

    // Get pagination and sorting options
    const paginationSort = this.getPaginationAndSortOptions(options);

    // Execute all promises in parallel for efficiency
    const [totalCount, ratingStats] = await Promise.all([
      TurfReview.countDocuments(filter),
      TurfReview.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ])
    ]);

    let userReview: any = null;

    // If requesting user ID is provided, efficiently fetch their review first
    // This leverages the compound index {turf: 1, user: 1}
    if (requestingUserId && filter.turf) {
      userReview = await TurfReview.findOne({
        turf: filter.turf,
        user: requestingUserId
      })
        .populate(populateOptions.populateField, populateOptions.populateSelect)
        .lean();
    }

    // Modify the filter to exclude the user's review if we already found it
    // This prevents duplicate retrieval and ensures efficient pagination
    const reviewsFilter = userReview
      ? { ...filter, _id: { $ne: userReview._id } }
      : filter;

    // Fetch all other reviews according to filter and sorting
    let allReviews = await TurfReview.find(reviewsFilter)
      .sort(paginationSort.sort)
      .skip(options.skip ?? 0)
      .limit(userReview ? (options.limit ? options.limit - 1 : 9) : (options.limit ?? 10))
      .populate(populateOptions.populateField, populateOptions.populateSelect)
      .lean();

    // If we found the user's review, add it to the beginning of the results
    if (userReview) {
      allReviews.unshift(userReview);
    }

    return {
      reviews: allReviews,
      total: totalCount,
      ...this.calculateRatingStats(ratingStats),
    };
  }

  // Get a single review by ID
  async getReviewById(reviewId: string): Promise<ITurfReview | null> {
    return await TurfReview.findById(reviewId)
      .populate("user", "_id first_name last_name email isVerified")
      .populate("turf", "_id name organization sports team_size")
      .lean();
  }

  // Get a summary of reviews for a specific turf
  async getTurfReviewSummary(turfId: string) {
    const result = await TurfReview.aggregate([
      { $match: { turf: new mongoose.Types.ObjectId(turfId) } },
      {
        $group: {
          _id: "$turf",
          averageRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    return result[0] ?? { averageRating: 0, reviewCount: 0 };
  }

  // Get reviews by user
  async getReviewsByUser(
    userId: string,
    options: ReviewFilterOptions = {}
  ): Promise<ReviewSummary> {
    const filter = { user: userId };
    const matchStage = { user: new mongoose.Types.ObjectId(userId) };

    // Use the extracted common method
    return this.getReviewsWithStats(
      filter,
      matchStage,
      {
        populateField: "turf",
        populateSelect: "_id name organization sports team_size",
      },
      options
    );
  }

  // Helper to apply rating filters to both filter object and match stage
  private applyRatingFilters(
    filter: any,
    matchStage: any,
    options: ReviewFilterOptions
  ): void {
    if (options.minRating !== undefined) {
      filter.rating = { $gte: options.minRating };
      matchStage.rating = { $gte: options.minRating };
    }

    if (options.maxRating !== undefined) {
      filter.rating = { ...filter.rating, $lte: options.maxRating };
      matchStage.rating = { ...matchStage.rating, $lte: options.maxRating };
    }
  }

  // Helper to get pagination and sort options
  private getPaginationAndSortOptions(options: ReviewFilterOptions): {
    limit: number;
    skip: number;
    sort: any;
  } {
    const limit = options.limit ?? 10;
    const skip = options.skip ?? 0;
    const sort: any = {};
    sort[options.sortBy ?? "createdAt"] = options.sortOrder === "asc" ? 1 : -1;

    return { limit, skip, sort };
  }

  // Helper to calculate rating statistics from aggregation results
  private calculateRatingStats(ratingStats: any[]): {
    averageRating: number;
    ratingDistribution: { [rating: number]: number };
  } {
    let totalRatingsSum = 0;
    let totalReviewsCount = 0;
    const ratingDistribution: { [rating: number]: number } = {};

    for (const stat of ratingStats) {
      const rating = stat._id;
      const count = stat.count;
      ratingDistribution[rating] = count;
      totalRatingsSum += rating * count;
      totalReviewsCount += count;
    }

    const averageRating =
      totalReviewsCount > 0 ? totalRatingsSum / totalReviewsCount : 0;

    return {
      averageRating,
      ratingDistribution,
    };
  }

  // Check if a user has already reviewed a turf
  async hasUserReviewedTurf(userId: string, turfId: string): Promise<boolean> {
    const review = await TurfReview.findOne({
      turf: turfId,
      user: userId
    });

    return review !== null;
  }

  // Get all reviews summary for a specific organization
  async getOrganizationTurfReviewSummary(organizationId: string) {

    const organizationExists = await mongoose.model('Organization').exists({ _id: organizationId });
    if (!organizationExists) {
      throw new Error("Organization not found");
    }

    // Use aggregation to efficiently get all data in a single query
    const turfs = await Turf.aggregate([
      // Stage 1: Match all turfs belonging to this organization
      { $match: { organization: new mongoose.Types.ObjectId(organizationId) } },

      // Stage 2: Lookup reviews for each turf
      {
        $lookup: {
          from: "turfreviews", // Collection name (lowercase and plural)
          localField: "_id",
          foreignField: "turf",
          as: "turfReviews"
        }
      },

      // Stage 3: Calculate review stats for each turf
      {
        $project: {
          _id: 1,
          name: 1,
          sports: 1,
          team_size: 1,
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: "$turfReviews" }, 0] },
              then: { $avg: "$turfReviews.rating" },
              else: 0
            }
          },
          reviewCount: { $size: "$turfReviews" }
        }
      }
    ]);

    // Calculate organization-level summary
    let totalReviews = 0;
    let ratingSum = 0;

    turfs.forEach(turf => {
      totalReviews += turf.reviewCount;
      // Only add to ratingSum if the turf has reviews
      // This avoids 0 values skewing the organization average
      if (turf.reviewCount > 0) {
        ratingSum += (turf.averageRating * turf.reviewCount);
      }
    });

    const organizationAverageRating = totalReviews > 0 ? ratingSum / totalReviews : 0;

    return {
      turfs,
      summary: {
        totalTurfs: turfs.length,
        totalReviews,
        organizationAverageRating
      }
    };
  }
}
