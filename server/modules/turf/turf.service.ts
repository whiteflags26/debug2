import mongoose from "mongoose";
import Organization from "../organization/organization.model";
import { ITurf, Turf } from "./turf.model";
import { TimeSlot } from "../timeslot/timeslot.model";
import { uploadImage, deleteImage } from "../../utils/cloudinary";
import ErrorResponse from "./../../utils/errorResponse";
import { extractPublicIdFromUrl } from "../../utils/extractUrl";
import { FilterOptions } from "./../../types/filter.d";
import SportsService from "../sports/sports.service";
import TeamSizeService from "../team_size/team_size.service";
import { TurfReview } from "../turf-review/turf-review.model";
import User from "../user/user.model";

export default class TurfService {
  private sportsService: SportsService;
  private teamSizeService: TeamSizeService;

  constructor() {
    this.sportsService = new SportsService();
    this.teamSizeService = new TeamSizeService();
  }

  /**
   * @desc Validate turf data (sports and team size)
   * @private
   */
  private async validateTurfData(sports: string[], teamSize: number): Promise<void> {
    // Validate sports exist
    await this.sportsService.validateSports(sports);

    // Validate team size exists
    await this.teamSizeService.validateTeamSizes([teamSize]);
  }

  /**@desc Create new turf with image upload and data validation**/
  async createTurf(
    turfData: Partial<ITurf>,
    images?: Express.Multer.File[]
  ): Promise<ITurf> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Validate sports and team size before creating turf
      if (turfData.sports && turfData.team_size) {
        await this.validateTurfData(turfData.sports, turfData.team_size);
      } else {
        throw new ErrorResponse("Sports and team size are required", 400);
      }

      // Check if a turf with the same name already exists in this organization
      const existingTurf = await Turf.findOne({
        name: turfData.name,
        organization: turfData.organization
      });

      if (existingTurf) {
        throw new ErrorResponse("A turf with this name already exists in the organization", 400);
      }

      // Upload images if provided
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map((image) => uploadImage(image));
        const uploadedImages = await Promise.all(uploadPromises);
        imageUrls = uploadedImages.map((img) => img.url);
      }

      // Create turf with or without images
      const turf = new Turf({
        ...turfData,
        images: imageUrls,
      });

      const savedTurf = await turf.save({ session });

      // Update organization by pushing turf ID
      await Organization.findByIdAndUpdate(
        turfData.organization,
        { $push: { turfs: savedTurf._id } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      return savedTurf;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error(error);
      throw new ErrorResponse(
        error instanceof ErrorResponse ? error.message : "Failed to create turf",
        error instanceof ErrorResponse ? error.statusCode : 500
      );
    }
  }

  /**@desc Retrieve all turfs with basic filtering options **/
  async getTurfs(filters = {}): Promise<ITurf[]> {
    return await Turf.find(filters);
  }

  /**@desc Retrieve turf by ID **/
  async getTurfById(id: string): Promise<ITurf | null> {
    // Since we're already storing turf IDs in the organization model,
    // we can use a simpler, more efficient population strategy
    return await Turf.findById(id).populate({
      path: "organization",
      select: "_id name facilities location images orgContactPhone orgContactEmail" // Select only needed fields
    });
  }

  /**@desc Update turf by ID with image upload and data validation **/
  async updateTurf(
    id: string,
    updateData: Partial<ITurf>,
    newImages?: Express.Multer.File[]
  ): Promise<ITurf | null> {
    try {
      const turf = await Turf.findById(id);
      if (!turf) throw new ErrorResponse("Turf not found", 404);

      // Prevent organization updates
      if (updateData.organization && !updateData.organization.equals(turf.organization)) {
        throw new ErrorResponse("Cannot change the organization of an existing turf", 400);
      }

      // If updating name, check uniqueness within organization
      if (updateData.name && updateData.name !== turf.name) {
        const existingTurf = await Turf.findOne({
          name: updateData.name,
          organization: turf.organization,
          _id: { $ne: id } // exclude current turf
        });

        if (existingTurf) {
          throw new ErrorResponse("A turf with this name already exists in the organization", 400);
        }
      }

      // Validate sports and team size if they're being updated
      if (updateData.sports || updateData.team_size) {
        const sportsToValidate = updateData.sports || turf.sports;
        const teamSizeToValidate = updateData.team_size || turf.team_size;
        await this.validateTurfData(sportsToValidate, teamSizeToValidate);
      }

      // Handle image updates
      if (newImages && newImages.length > 0) {
        // Upload new images
        const uploadPromises = newImages.map((image) => uploadImage(image));
        const uploadedImages = await Promise.all(uploadPromises);
        const newImageUrls = uploadedImages.map((img) => img.url);

        // Delete old images if they exist
        if (turf.images.length > 0) {
          await Promise.all(
            turf.images.map((imgUrl) => {
              const publicId = extractPublicIdFromUrl(imgUrl);
              return publicId ? deleteImage(publicId) : Promise.resolve();
            })
          );
        }

        updateData.images = newImageUrls;
      }

      const updatedTurf = await Turf.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      return updatedTurf;
    } catch (error) {
      console.error(error);
      throw new ErrorResponse(
        error instanceof ErrorResponse ? error.message : "Failed to update turf",
        error instanceof ErrorResponse ? error.statusCode : 500
      );
    }
  }

  /**@desc Delete turf by ID and all associated reviews **/
  async deleteTurf(id: string): Promise<ITurf | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const turf = await Turf.findById(id);
      if (!turf) return null;

      // Delete images from Cloudinary
      if (turf.images && turf.images.length > 0) {
        await Promise.all(
          turf.images.map(async (imageUrl) => {
            const publicId = extractPublicIdFromUrl(imageUrl);
            if (publicId) {
              await deleteImage(publicId);
            }
          })
        );
      }

      // First, find all associated reviews
      const reviews = await TurfReview.find({ turf: id });

      // Process each review
      for (const review of reviews) {
        // Delete review images from Cloudinary if they exist
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

        // Update User document to remove reference to this review
        await User.findByIdAndUpdate(
          review.user,
          { $pull: { reviews: review._id } },
          { session }
        );
      }

      // Delete all reviews associated with this turf
      await TurfReview.deleteMany({ turf: id }).session(session);

      // Remove turf ID from organization
      await Organization.findByIdAndUpdate(
        turf.organization,
        { $pull: { turfs: turf._id } },
        { session }
      );

      // Delete the turf itself
      const deletedTurf = await Turf.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      session.endSession();

      return deletedTurf;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      console.error("Error deleting turf:", error);
      throw new ErrorResponse("Failed to delete turf", 500);
    }
  }

  /**@desc filter turfs based on price, team_size, facilities, preferred_time, location and radius, sports**/
  async filterTurfs(filterOptions: FilterOptions) {
    try {
      // Parse and validate filter options
      const {
        query,
        aggregatePipeline,
        page = 1,
        limit = 10,
      } = await this.buildFilterQuery(filterOptions);

      // Execute query based on whether we need aggregation or not
      let turfs;
      let totalResults;

      if (aggregatePipeline.length > 0) {
        // If we need aggregation (for facilities or complex filters)
        aggregatePipeline.unshift({ $match: query });

        // Add population of organization with only necessary fields
        aggregatePipeline.push({
          $lookup: {
            from: "organizations",
            localField: "organization",
            foreignField: "_id",
            as: "organization"
          }
        });

        // Convert array to single object
        aggregatePipeline.push({
          $addFields: {
            organization: { $arrayElemAt: ["$organization", 0] }
          }
        });

        // Add pagination to aggregation
        const skip = (Number(page) - 1) * Number(limit);
        const paginatedPipeline = [
          ...aggregatePipeline,
          { $skip: skip },
          { $limit: Number(limit) },
        ];

        // Execute aggregation
        turfs = await Turf.aggregate(paginatedPipeline);

        // Count total results (without pagination)
        const countPipeline = [...aggregatePipeline];
        const countResults = await Turf.aggregate([
          ...countPipeline,
          { $count: "total" },
        ]);

        totalResults = countResults.length > 0 ? countResults[0].total : 0;
      } else {
        // Use regular find query (more efficient when possible)
        const skip = (Number(page) - 1) * Number(limit);

        turfs = await Turf.find(query)
          .skip(skip)
          .limit(Number(limit))
          .populate("organization", "_id name facilities location images orgContactPhone orgContactEmail")
          .exec();

        totalResults = await Turf.countDocuments(query);
      }

      // Calculate pagination info
      const totalPages = Math.ceil(totalResults / Number(limit));

      return {
        success: true,
        count: turfs.length,
        data: turfs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalResults,
        },
      };
    } catch (error) {
      console.error("Error filtering turfs:", error);
      throw new ErrorResponse("Failed to filter turfs", 500);
    }
  }

  /**@desc Build filter query based on filter options**/
  private async buildFilterQuery(filterOptions: FilterOptions) {
    const {
      minPrice,
      maxPrice,
      teamSize,
      sports,
      facilities,
      preferredDate,
      preferredTimeStart,
      preferredTimeEnd,
      latitude,
      longitude,
      radius = "5", // Default radius 5km
      page = "1",
      limit = "10",
    } = filterOptions;

    // Base query
    const query: any = {};
    const aggregatePipeline: any[] = [];

    this.applyPriceFilter(query, minPrice, maxPrice);
    this.applyTeamSizeFilter(query, teamSize);
    this.applySportsFilter(query, sports);
    const preferredTimeRange =
      preferredTimeStart && preferredTimeEnd
        ? { start: preferredTimeStart, end: preferredTimeEnd }
        : undefined;
    await this.applyTimeSlotFilter(query, preferredDate, preferredTimeRange);

    const organizationIds = await this.findNearbyOrganizations(
      query,
      latitude,
      longitude,
      radius
    );

    this.applyFacilitiesFilter(aggregatePipeline, facilities);

    return {
      query,
      aggregatePipeline,
      page: Number(page),
      limit: Number(limit),
      organizationIds,
    };
  }

  /**@desc utility function to apply price filter on buildFilterQuery function**/
  private applyPriceFilter(query: any, minPrice?: string, maxPrice?: string) {
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.basePrice = {};
      if (minPrice !== undefined) query.basePrice.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.basePrice.$lte = Number(maxPrice);
    }
  }

  /**@desc utility function to apply team size filter on buildFilterQuery function**/
  private applyTeamSizeFilter(query: any, teamSize?: string | string[]) {
    if (teamSize !== undefined) {
      const sizes = Array.isArray(teamSize) ? teamSize : [teamSize];
      const parsedSizes = sizes.map((size) => Number(size));
      if (parsedSizes.length > 0) {
        query.team_size = { $in: parsedSizes };
      }
    }
  }

  /**@desc utility function to apply sports filter on buildFilterQuery function**/
  private applySportsFilter(query: any, sports?: string | string[]) {
    if (sports) {
      const sportsList = Array.isArray(sports) ? sports : [sports];
      if (sportsList.length > 0) {
        query.sports = { $in: sportsList };
      }
    }
  }

  /**@desc utility function to apply time preference filter on buildFilterQuery function**/
  private async applyTimeSlotFilter(
    query: any,
    preferredDate?: string,
    preferredTimeRange?: { start: string; end: string }
  ) {
    if (!preferredDate || !preferredTimeRange) return;

    const date = new Date(preferredDate);
    date.setHours(0, 0, 0, 0);

    const [startHour, startMinute] = preferredTimeRange.start
      .split(":")
      .map(Number);
    const [endHour, endMinute] = preferredTimeRange.end.split(":").map(Number);

    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0);

    const now = new Date();
    if (endDateTime < now) {
      query._id = { $in: [] }; // Entire time range is in the past, no need to query
      return;
    }

    const matchingSlots = await TimeSlot.find({
      is_available: true,
      start_time: { $gte: startDateTime },
      end_time: { $lte: endDateTime },
    }).distinct("turf");

    query._id = { $in: matchingSlots };
  }

  /**@desc utility function to find nearby organization for buildFilterQuery function**/
  private async findNearbyOrganizations(
    query: any,
    latitude?: string,
    longitude?: string,
    radius?: string
  ): Promise<mongoose.Types.ObjectId[]> {
    if (!latitude || !longitude || !radius) return [];

    // Convert radius from km to meters
    const radiusInMeters = Number(radius) * 1000;

    // First find all organizations within the radius
    const nearbyOrganizations = await Organization.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          $maxDistance: radiusInMeters,
        },
      },
    }).select("_id");

    interface OrgDocument {
      _id: mongoose.Types.ObjectId;
    }

    const organizationIds = nearbyOrganizations.map(
      (org) => (org as unknown as OrgDocument)._id
    );

    // If organizations found, add to query
    if (organizationIds.length > 0) {
      query.organization = { $in: organizationIds };
    } else {
      // No organizations in radius, return empty query that will match nothing
      query._id = { $exists: false };
    }

    return organizationIds;
  }

  /**@desc utility function to apply facilities filter on buildFilterQuery function**/
  private applyFacilitiesFilter(
    aggregatePipeline: any[],
    facilities?: string | string[]
  ) {
    if (facilities) {
      const facilitiesList = Array.isArray(facilities)
        ? facilities
        : [facilities];

      if (facilitiesList.length > 0) {
        aggregatePipeline.push(
          {
            $lookup: {
              from: "organizations",
              localField: "organization",
              foreignField: "_id",
              as: "organizationData",
            },
          },
          {
            $unwind: {
              path: "$organizationData",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $match: {
              "organizationData.facilities": { $all: facilitiesList },
            },
          },
          {
            $set: {
              organization: "$organizationData",
            },
          }
        );
      }
    }
  }

  /**
   * @desc Check if a turf is currently open or closed
   * @param turfId - The ID of the turf to check
   * @returns Object containing open status and next opening/closing time
   */
  async checkTurfStatus(turfId: string) {
    const turf = await Turf.findById(turfId);
    if (!turf) {
      throw new ErrorResponse("Turf not found", 404);
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0-6 (Sunday-Saturday)
    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    // Find today's operating hours
    const todayHours = turf.operatingHours.find(
      (hour) => hour.day === currentDay
    );
    if (!todayHours) {
      return {
        isOpen: false,
        status: "CLOSED",
        message: "Turf is closed today",
      };
    }

    // Check if current time is within operating hours
    const isOpen =
      currentTime >= todayHours.open && currentTime <= todayHours.close;

    return {
      isOpen,
      status: isOpen ? "OPEN" : "CLOSED",
      message: isOpen ? `Open until ${todayHours.close}` : "Currently closed",
    };
  }

  /**
 * @desc Get all turfs belonging to a specific organization
 * @param organizationId - The ID of the organization
 * @returns Array of turfs belonging to the organization
 */
  async getTurfsByOrganizationId(organizationId: string): Promise<ITurf[]> {
    try {
      // First verify the organization exists
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new ErrorResponse('Organization not found', 404);
      }

      // Get all turfs for this organization
      const turfs = await Turf.find({ organization: organizationId })
        .populate({
          path: 'organization',
          select: '_id name location' // Only include necessary fields
        });

      return turfs;
    } catch (error) {
      console.error('Error fetching turfs by organization:', error);
      throw new ErrorResponse(
        error instanceof ErrorResponse ? error.message : 'Failed to fetch turfs',
        error instanceof ErrorResponse ? error.statusCode : 500
      );
    }
  }
}