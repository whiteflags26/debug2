import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import asyncHandler from "../../shared/middleware/async";
import ErrorResponse from "../../utils/errorResponse";
import { AuthRequest } from "../auth/auth.middleware";
import { IOrganization } from "./organization.model";
import { organizationService } from "./organization.service";
import validator from "validator";

interface CreateOrganizationBody {
  name: string;
  facilities: string[];
  requestId?: string;
  wasEdited?: boolean;
  orgContactPhone: string;
  orgContactEmail: string;
  location: {
    place_id: string;
    address: string;
    coordinates: {
      type: "Point";
      coordinates: [number, number];
    };
    area?: string;
    sub_area?: string;
    city: string;
    post_code?: string;
  };
}

interface AssignOwnerBody {
  userId: string;
}
// Interface for Update Organization Body
interface UpdateOrganizationBody
  extends Omit<Partial<CreateOrganizationBody>, "facilities"> {
  facilities?: string | string[];
  imagesToKeep?: string[];
  orgContactPhone?: string;
  orgContactEmail?: string;
}

// Interface for Create Role Body
interface CreateRoleBody {
  roleName: string;
  permissions: string[]; // Array of permission names
}

// Interface for Assign Role Body
interface AssignRoleBody {
  roleId: string;
}

/**
 * @route   POST /api/v1/organizations
 * @desc    Create a new organization
 * @access  Private (Admin only)
 */
export const createOrganization = asyncHandler(
  async (
    req: AuthRequest & {
      body: CreateOrganizationBody & {
        requestId?: string;
        adminNotes?: string;
      };
    },
    res: Response,
    next: NextFunction
  ) => {
    const {
      name,
      facilities,
      requestId,
      adminNotes,
      orgContactEmail,
      orgContactPhone,
    } = req.body;

    // Validate user authentication first
    if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Input validation
    if (!name) {
      return next(new ErrorResponse("Name is required", 400));
    }
    if (!orgContactEmail) {
      return next(new ErrorResponse("Contact email is required", 400));
    }
    if (!orgContactPhone) {
      return next(new ErrorResponse("Contact phone is required", 400));
    }

    // Sanitize organization name
    const sanitizedName =
      name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    let parsedFacilities: IOrganization["facilities"];
    let location: IOrganization["location"];

    // Parse facilities
    try {
      // First validate if facilities exists
      if (!facilities) {
        return next(new ErrorResponse("Facilities are required", 400));
      }

      // Parse facilities if it's a string, otherwise validate array
      parsedFacilities =
        typeof facilities === "string" ? JSON.parse(facilities) : facilities;

      // Validate that parsed result is an array
      if (!Array.isArray(parsedFacilities)) {
        return next(new ErrorResponse("Facilities must be an array", 400));
      }

      // Validate array is not empty
      if (parsedFacilities.length === 0) {
        return next(
          new ErrorResponse("At least one facility is required", 400)
        );
      }

      // Validate array elements are strings
      if (!parsedFacilities.every((facility) => typeof facility === "string")) {
        return next(new ErrorResponse("All facilities must be strings", 400));
      }

      // Sanitize facility names
      parsedFacilities = parsedFacilities.map(
        (facility) =>
          facility.charAt(0).toUpperCase() + facility.slice(1).toLowerCase()
      );
    } catch (error) {
      console.error("Facilities parsing error:", error);
      return next(
        new ErrorResponse(
          `Invalid facilities format: ${(error as Error).message}`,
          400
        )
      );
    }

    // Parse and validate location
    try {
      const parsedLocation =
        typeof req.body.location === "string"
          ? JSON.parse(req.body.location)
          : req.body.location;

      // Validate required location fields
      if (!parsedLocation) {
        return next(new ErrorResponse("Location is required", 400));
      }

      const requiredFields = ["place_id", "address", "coordinates", "city"];
      const missingFields = requiredFields.filter(
        (field) => !parsedLocation[field]
      );

      if (missingFields.length > 0) {
        return next(
          new ErrorResponse(
            `Missing required location fields: ${missingFields.join(", ")}`,
            400
          )
        );
      }

      if (
        !parsedLocation.coordinates.type ||
        !parsedLocation.coordinates.coordinates
      ) {
        return next(new ErrorResponse("Invalid coordinates format", 400));
      }

      location = parsedLocation;
    } catch (error) {
      return next(
        new ErrorResponse(
          `Invalid location format: ${(error as Error).message}`,
          400
        )
      );
    }

    if (!req.body.orgContactPhone) {
      return next(new ErrorResponse("Contact phone is required", 400));
    }

    if (!req.body.orgContactEmail) {
      return next(new ErrorResponse("Contact email is required", 400));
    }

    // Validate email format
    if (!validator.isEmail(req.body.orgContactEmail)) {
      return next(new ErrorResponse("Invalid contact email format", 400));
    }

    const images = req.files as Express.Multer.File[];

    // Create organization
    const organization = await organizationService.createOrganization(
      sanitizedName,
      parsedFacilities,
      location,
      orgContactPhone,
      orgContactEmail,
      images,
      requestId ? requestId : undefined,
      req.user.id,
      adminNotes ? adminNotes : undefined
    );

    res.status(201).json({
      success: true,
      data: organization,
      message: requestId
        ? "Organization created and request approved successfully"
        : "Organization created successfully",
    });
  }
);

/**
 * @route   POST /api/v1/organizations/:id/assign-owner
 * @desc    Assign a user as the owner of an organization
 * @access  Private (Requires 'assign_organization_owner' permission)
 */
export const assignOwner = asyncHandler(
  async (
    req: AuthRequest & { params: { id: string }; body: AssignOwnerBody },
    res: Response,
    next: NextFunction
  ) => {
    const { id: organizationId } = req.params;
    const { userId } = req.body;

    // Validate required fields
    if (!userId) {
      return next(new ErrorResponse("User ID is required", 400));
    }

    // Validate MongoDB IDs
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return next(new ErrorResponse("Invalid Organization ID", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new ErrorResponse("Invalid User ID", 400));
    }

    const updatedOrganization =
      await organizationService.assignOwnerToOrganization(
        organizationId,
        userId
      );

    res.status(200).json({
      success: true,
      data: updatedOrganization,
      message: `User ${userId} assigned as owner successfully`,
    });
  }
);

/**
 * @route   PUT /api/v1/organizations/:id
 * @desc    Update an organization
 * @access  Private (Admin only)
 */
export const updateOrganization = asyncHandler(
  async (
    req: AuthRequest & { params: { id: string }; body: UpdateOrganizationBody },
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { name, facilities, location, ...rest } = req.body;

    const newImages = req.files as Express.Multer.File[];

    const updateData: Partial<IOrganization> = {};

    // Sanitize and add name if provided
    if (name) {
      updateData.name =
        name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }

    // Sanitize and add facilities if provided
    if (facilities) {
      let parsedFacilities =
        typeof facilities === "string" ? JSON.parse(facilities) : facilities;

      // Validate array elements are strings
      if (
        !Array.isArray(parsedFacilities) ||
        !parsedFacilities.every((facility) => typeof facility === "string")
      ) {
        return next(
          new ErrorResponse("Facilities must be an array of strings", 400)
        );
      }

      // Sanitize facility names
      updateData.facilities = parsedFacilities.map(
        (facility) =>
          facility.charAt(0).toUpperCase() + facility.slice(1).toLowerCase()
      );
    }

    if (location) {
      updateData.location =
        typeof location === "string" ? JSON.parse(location) : location;
    }

    Object.assign(updateData, rest);

    const organization = await organizationService.updateOrganization(
      id,
      updateData,
      newImages
    );

    if (!organization) {
      return next(new ErrorResponse("Organization not found", 404));
    }

    res.status(200).json({
      success: true,
      data: organization,
      message: "Organization updated successfully",
    });
  }
);

/**
 * @route   DELETE /api/v1/organizations/:id
 * @desc    Delete an organization
 * @access  Private (Admin only)
 */
export const deleteOrganization = asyncHandler(
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const result = await organizationService.deleteOrganization(id);

    if (result.deletedCount === 0) {
      return next(new ErrorResponse("Organization not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully",
    });
  }
);

/**
 * @route   POST /api/v1/organizations/:id/roles
 * @desc    Create a new role within an organization
 * @access  Private (Requires 'manage_organization_roles' permission for this organization)
 */
export const createOrganizationRole = asyncHandler(
  async (
    req: AuthRequest & { params: { id: string }; body: CreateRoleBody },
    res: Response,
    next: NextFunction
  ) => {
    const { id: organizationId } = req.params;
    const { roleName, permissions } = req.body;

    // Validate required fields
    if (!roleName || !permissions) {
      return next(
        new ErrorResponse("Role name and permissions are required", 400)
      );
    }

    // Validate permissions array
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return next(
        new ErrorResponse("Permissions must be a non-empty array", 400)
      );
    }

    // Validate Organization ID
    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return next(new ErrorResponse("Invalid Organization ID", 400));
    }

    const newRole = await organizationService.createOrganizationRole(
      organizationId,
      roleName,
      permissions
    );

    res.status(201).json({
      success: true,
      data: newRole,
      message: `Role '${roleName}' created successfully for organization ${organizationId}`,
    });
  }
);

/**
 * @route   GET /api/organizations/:organizationId/other-turfs/:turfId
 * @desc    Fetch other turfs from the same organization excluding the current turf
 * @access  Public
 */
export const fetchOtherTurfs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { organizationId, turfId } = req.params;
    const turfs = await organizationService.getOtherTurfsByOrganization(
      organizationId,
      turfId
    );
    res.status(200).json({ success: true, data: turfs });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/organizations/:id
 * @desc    Get organization by ID
 * @access  Public
 */
export const getOrganization = asyncHandler(
  async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const organization = await organizationService.getOrganizationById(id);

    res.status(200).json({
      success: true,
      data: organization,
    });
  }
);
