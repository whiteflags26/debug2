import { Request, Response } from "express";
import { Turf } from "../turf/turf.model";
import Organization from "../organization/organization.model";

/**
 * Search suggestions endpoint
 * Returns quick suggestions for the search bar
 */
export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const searchRegex = new RegExp(query.trim(), "i");

    // Limit results for quick suggestions
    const limit = 5;

    // Find matching turfs
    const turfs = await Turf.find({
      name: searchRegex,
    })
      .select("_id name sports team_size organization")
      .populate({
        path: "organization",
        select: "name location.city",
      })
      .limit(limit);

    // Find matching organizations
    const organizations = await Organization.find({
      $or: [
        { name: searchRegex },
        { "location.address": searchRegex },
        { "location.area": searchRegex },
        { "location.city": searchRegex },
      ],
    })
      .select("_id name location.city")
      .limit(limit);

    // Format suggestions
    const suggestions = [
      ...turfs.map((turf) => {
        const orgData = turf.organization as unknown as {
          name: string;
          location: { city: string };
        };
        return {
          _id: turf._id,
          name: turf.name,
          type: "turf" as const,
          location: orgData?.location?.city,
          sport: turf.sports?.[0],
        };
      }),
      ...organizations.map((org) => ({
        _id: org._id,
        name: org.name,
        type: "organization" as const,
        location: org.location?.city,
      })),
    ];

    // Sort by relevance (exact matches first)
    const sortedSuggestions = suggestions.sort((a, b) => {
      const aStartsWithQuery = a.name
        .toLowerCase()
        .startsWith(query.toLowerCase())
        ? -1
        : 0;
      const bStartsWithQuery = b.name
        .toLowerCase()
        .startsWith(query.toLowerCase())
        ? -1
        : 0;
      return aStartsWithQuery - bStartsWithQuery;
    });

    res.status(200).json({
      success: true,
      data: sortedSuggestions.slice(0, limit),
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching search suggestions",
      error: (error as Error).message,
    });
  }
};

/**
 * Main search endpoint
 * Handles comprehensive search with pagination
 */
export const search = async (req: Request, res: Response) => {
  try {
    const { query, location, sport, page = "1", limit = "10" } = req.query;
    const searchQuery = (query as string) || "";
    const sportQuery = (sport as string) || "";
    const locationQuery = (location as string) || "";
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Base pipeline for aggregation
    const pipeline: any[] = [];

    // Match stage for initial filtering
    const matchConditions: any[] = [];

    // Search by turf name
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      matchConditions.push({ name: searchRegex });
    }

    // Filter by sport
    if (sportQuery) {
      matchConditions.push({ sports: sportQuery });
    }

    // Apply initial match if we have conditions
    if (matchConditions.length > 0) {
      pipeline.push({
        $match: { $or: matchConditions },
      });
    }

    // Join with organization data
    pipeline.push({
      $lookup: {
        from: "organizations",
        localField: "organization",
        foreignField: "_id",
        as: "organizationData",
      },
    });

    // Unwind the organization array to get a single object
    pipeline.push({
      $unwind: "$organizationData",
    });

    // Add organization-based conditions
    const orgConditions: any[] = [];

    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      orgConditions.push({ "organizationData.name": searchRegex });
    }

    if (locationQuery) {
      const locationRegex = new RegExp(locationQuery, "i");
      orgConditions.push({
        "organizationData.location.address": locationRegex,
      });
      orgConditions.push({ "organizationData.location.area": locationRegex });
      orgConditions.push({
        "organizationData.location.sub_area": locationRegex,
      });
      orgConditions.push({ "organizationData.location.city": locationRegex });
    }

    // Apply organization match if we have conditions
    if (orgConditions.length > 0) {
      pipeline.push({
        $match: { $or: orgConditions },
      });
    }

    // Add a match stage that combines conditions from both turf and org
    if (matchConditions.length > 0 && orgConditions.length > 0) {
      // We already applied individual match stages, now let's replace with a combined one
      // This is to ensure we match turfs that either match turf conditions OR org conditions
      pipeline.splice(0, pipeline.length); // Clear previous pipeline

      pipeline.push({
        $lookup: {
          from: "organizations",
          localField: "organization",
          foreignField: "_id",
          as: "organizationData",
        },
      });

      pipeline.push({
        $unwind: "$organizationData",
      });

      pipeline.push({
        $match: {
          $or: [{ $or: matchConditions }, { $or: orgConditions }],
        },
      });
    }

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: "total" });
    const countResult = await Turf.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Add pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    // Project only the fields we need
    pipeline.push({
      $project: {
        _id: 1,
        name: 1,
        basePrice: 1,
        sports: 1,
        team_size: 1,
        images: { $slice: ["$images", 1] },
        organization: {
          _id: "$organizationData._id",
          name: "$organizationData.name",
          location: {
            address: "$organizationData.location.address",
            city: "$organizationData.location.city",
          },
        },
      },
    });

    // Execute search query
    const results = await Turf.aggregate(pipeline);

    res.status(200).json({
      success: true,
      data: {
        results,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during search",
      error: (error as Error).message,
    });
  }
};
