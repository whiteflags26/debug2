// organization-request.service.ts (Updated)
import mongoose, { Types } from "mongoose";
import validator from "validator";

import User from "../user/user.model";
import OrganizationRequest, {
  RequestStatus,
  IOrganizationRequest,
} from "./organization-request.model";
import { uploadImage } from "../../utils/cloudinary";
import ErrorResponse from "../../utils/errorResponse";
import { sendEmail } from "../../utils/email";
import FaciltyService from "../facility/facility.service";


interface CreateRequestDto {
  organizationName: string;
  facilities: string[];
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
  contactPhone: string;
  ownerEmail: string;
  requestNotes?: string;
  orgContactPhone: string;
  orgContactEmail: string; 
}

interface ProcessingResult {
  success: boolean;
  message: string;
  data?: any;
}

export interface RequestFilters {
  status?: RequestStatus | RequestStatus[];
  fromDate?: Date;
  toDate?: Date;
  requesterEmail?: string;
  ownerEmail?: string;
  sortBy?: "createdAt" | "updatedAt" | "organizationName";
  sortOrder?: "asc" | "desc";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface RequestsResult {
  total: number;
  page: number;
  pages: number;
  requests: IOrganizationRequest[];
}

export default class OrganizationRequestService {
  facilityService = new FaciltyService();

  // Validates the owner email by checking if it exists in the user database
  public async validateOwnerEmail(email: string): Promise<boolean> {
    if (!email || !validator.isEmail(email)) {
      return false;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).collation({ locale: "en", strength: 2 });

    return !!user;
  }

  // Creates a new organization request with images directly uploaded to Cloudinary
  public async createRequest(
    requesterId: string,
    requestData: CreateRequestDto,
    images?: Express.Multer.File[]
  ): Promise<IOrganizationRequest> {
    try {
      // Validate owner email exists in database
      const ownerExists = await this.validateOwnerEmail(requestData.ownerEmail);
      if (!ownerExists) {
        throw new ErrorResponse(
          "Owner email does not exist in the user database",
          400
        );
      }

      // Validate facilities
      await this.facilityService.validateFacilities(requestData.facilities);

      // Upload images directly to Cloudinary
      const imageUrls: string[] = [];
      if (images && images.length > 0) {
        const uploadPromises = images.map((image) => uploadImage(image));
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls.push(...uploadResults.map((result) => result.url));
      }

      // Create request
      const request = await OrganizationRequest.create({
        requesterId,
        status: "pending",
        ...requestData,
        images: imageUrls, // Store Cloudinary URLs directly
      });

      return request;
    } catch (error) {
      throw error;
    }
  }

  // Process an organization request
  public async startProcessing(
    requestId: string,
    adminId: string
  ): Promise<IOrganizationRequest> {
    const request = await OrganizationRequest.findById(requestId);
    if (!request) {
      throw new ErrorResponse("Request not found", 404);
    }

    if (request.status !== "pending") {
      throw new ErrorResponse(
        `Request cannot be processed. Current status: ${request.status}`,
        400
      );
    }

    request.status = "processing";
    request.processingAdminId = new Types.ObjectId(adminId);
    request.processingStartedAt = new Date();
    await request.save();

    return request;
  }

  // Cancel processing of a request
  public async cancelProcessing(
    requestId: string,
    adminId: string
  ): Promise<IOrganizationRequest> {
    const request = await OrganizationRequest.findById(requestId);
    if (!request) {
      throw new ErrorResponse("Request not found", 404);
    }

    if (request.status !== "processing") {
      throw new ErrorResponse("Request is not currently being processed", 400);
    }

    request.status = "pending";
    request.processingAdminId = undefined;
    request.processingStartedAt = undefined;
    await request.save();

    return request;
  }

  // Approve request and link to an existing organization with session support for transactions
  public async approveRequestWithSession(
    requestId: string,
    adminId: string,
    organizationId: string,
    wasEdited: boolean = false,
    adminNotes?: string,
    session?: mongoose.ClientSession
  ): Promise<ProcessingResult> {
    const options = session ? { session } : {};

    const request = await OrganizationRequest.findById(requestId).session(
      session || null
    );
    if (!request) {
      throw new ErrorResponse("Request not found", 404);
    }

    if (request.status !== "processing") {
      throw new ErrorResponse("Request is not in processing state", 400);
    }

    try {
      // Set the status based on whether the data was edited
      request.status = wasEdited ? "approved_with_changes" : "approved";

      // Set the organizationId reference
      request.organizationId = new mongoose.Types.ObjectId(organizationId);
      if (adminNotes) request.adminNotes = adminNotes;
      await request.save(options);

      // Notify requester - this is not part of the transaction
      // Only do this if we're not in a transaction or after transaction is complete
      if (!session) {
        await this.notifyRequestProcessed(request, true, wasEdited);
      }

      return {
        success: true,
        message: wasEdited
          ? "Organization request approved with changes"
          : "Organization request approved successfully",
        data: { request },
      };
    } catch (error: any) {
      console.error("Error approving request:", error);
      throw new ErrorResponse(
        error.message || "Failed to approve organization request",
        error.statusCode || 500
      );
    }
  }

  /**
 * Determines if organization data differs from the original request
 * @param requestId - ID of the organization request
 * @param orgName - Name of the organization to create
 * @param facilities - Facilities of the organization
 * @param location - Location object of the organization
 * @returns Promise<boolean> - True if data was edited from original request
 */
  public async wasRequestDataEdited(
    requestId: string,
    orgName: string,
    facilities: string[],
    location: any,
    orgContactPhone: string,
    orgContactEmail: string
  ): Promise<boolean> {
    try {
      // Get the original request
      const request = await this.getRequestById(requestId);
      if (!request) {
        throw new ErrorResponse('Organization request not found', 404);
      }

      // Check for differences between request and new organization data
      const nameChanged = request.organizationName !== orgName;

      // Compare facilities (order might be different so we need to sort)
      const facilitiesChanged =
        facilities.length !== request.facilities.length ||
        !facilities.every(f => request.facilities.includes(f));

      // Compare location (check essential fields)
      const locationChanged =
        request.location.place_id !== location.place_id ||
        request.location.address !== location.address ||
        request.location.city !== location.city ||
        request.location.coordinates.coordinates[0] !== location.coordinates.coordinates[0] ||
        request.location.coordinates.coordinates[1] !== location.coordinates.coordinates[1];

      const phoneChanged = request.orgContactPhone !== orgContactPhone;
      const emailChanged = request.orgContactEmail !== orgContactEmail;

      return nameChanged || facilitiesChanged || locationChanged || phoneChanged || emailChanged;
    } catch (error) {
      console.error('Error checking if request was edited:', error);
      throw new ErrorResponse('Failed to compare request data', 500);
    }
  }

  // Notify the requester about the request status
  private async notifyRequestProcessed(
    request: IOrganizationRequest,
    approved: boolean,
    wasEdited: boolean = false
  ): Promise<void> {
    try {
      const user = await User.findById(request.requesterId);
      if (!user) {
        console.error(`User ${request.requesterId} not found for notification`);
        return;
      }

      const isOwner = user.email === request.ownerEmail;
      const subject = this.getEmailSubject(approved);
      const recipientName = this.getRecipientName(user, isOwner);

      // Build main message
      const message = this.buildMainMessage(
        recipientName,
        request,
        approved,
        wasEdited,
        isOwner
      );

      // Handle owner notifications
      await this.handleOwnerNotifications(
        user,
        request,
        subject,
        message,
        approved,
        wasEdited,
        isOwner
      );
    } catch (error) {
      console.error("Failed to send notification email:", error);
    }
  }

  // Helper functions

  private getEmailSubject(approved: boolean): string {
    return approved
      ? "Organization Request Approved - TurfMania"
      : "Organization Request Rejected - TurfMania";
  }

  private getRecipientName(user: any, isOwner: boolean): string {
    return user.name || (isOwner ? "Owner" : "Valued Customer");
  }

  private buildMainMessage(
    recipientName: string,
    request: IOrganizationRequest,
    approved: boolean,
    wasEdited: boolean,
    isOwner: boolean
  ): string {
    let message = `Dear ${recipientName},\n\n`;

    if (approved) {
      message += this.buildApprovalMessage(request, wasEdited, isOwner);
    } else {
      message += this.buildRejectionMessage(request);
    }

    message += this.getCommonFooter();
    return message;
  }

  private buildApprovalMessage(
    request: IOrganizationRequest,
    wasEdited: boolean,
    isOwner: boolean
  ): string {
    let message =
      `We are pleased to inform you that your request to create organization "${request.organizationName
      }" has been approved${wasEdited ? " with some changes" : ""}.\n\n` +
      `The organization has been successfully created in our system and is now active.\n` +
      (request.organizationId
        ? `Organization ID: ${request.organizationId}\n\n`
        : "\n");

    if (wasEdited) {
      message += `Please note that some details of your request were modified during the approval process. You can view the final organization details in your dashboard.\n\n`;
    }

    if (isOwner) {
      message += `As the owner of "${request.organizationName}", you now have full administrative access to manage the organization.\n\n`;
    }

    return message;
  }

  private buildRejectionMessage(request: IOrganizationRequest): string {
    let message = `We regret to inform you that your request to create organization "${request.organizationName}" has been rejected.\n\n`;

    if (request.adminNotes) {
      message +=
        `Reason: ${request.adminNotes}\n\n` +
        `You may submit a new request after addressing the issues mentioned above.\n\n`;
    }

    return message;
  }

  private getCommonFooter(): string {
    return (
      `If you have any questions or need further assistance, please don't hesitate to contact our support team at supportMail@gmail.com.\n\n` +
      `Thank you for choosing TurfMania!\n\n` +
      `Best regards,\n` +
      `The TurfMania Team\n\n` +
      `[This is an automated message. Please do not reply directly to this email.]`
    );
  }

  private async handleOwnerNotifications(
    user: any,
    request: IOrganizationRequest,
    subject: string,
    message: string,
    approved: boolean,
    wasEdited: boolean,
    isOwner: boolean
  ): Promise<void> {
    if (isOwner) {
      // Send owner-specific message
      await sendEmail(user.email, subject, message);
    } else {
      // Send standard message to requester
      await sendEmail(user.email, subject, message);

      // Send owner-specific message to owner (if different)
      const ownerMessage = this.buildOwnerMessage(
        request,
        message,
        approved,
        wasEdited
      );
      await sendEmail(request.ownerEmail, subject, ownerMessage);
    }
  }

  private buildOwnerMessage(
    request: IOrganizationRequest,
    baseMessage: string,
    approved: boolean,
    wasEdited: boolean
  ): string {
    return (
      `Dear ${request.ownerEmail.split("@")[0]},\n\n` +
      `You had been designated as the owner of organization "${request.organizationName
      }" which was just ${approved
        ? wasEdited
          ? "approved with some modifications"
          : "approved"
        : "rejected"
      } on TurfMania.\n\n` +
      (approved
        ? `As the owner, you have full administrative access to manage the organization.\n\n`
        : "") +
      baseMessage.substring(
        baseMessage.indexOf("\n\nIf you have any questions")
      )
    );
  }

  // Reject request and notify requester
  public async rejectRequest(
    requestId: string,
    adminId: string,
    rejectionNotes: string
  ): Promise<IOrganizationRequest> {
    const request = await OrganizationRequest.findById(requestId);
    if (!request) {
      throw new ErrorResponse("Request not found", 404);
    }

    if (request.status !== "processing" && request.status !== "pending") {
      throw new ErrorResponse(
        "Request cannot be rejected in its current state",
        400
      );
    }

    request.status = "rejected";
    request.adminNotes = rejectionNotes;
    await request.save();

    // Notify requester
    await this.notifyRequestProcessed(request, false);

    return request;
  }

  public async getRequestById(
    requestId: string
  ): Promise<IOrganizationRequest> {
    const request = await OrganizationRequest.findById(requestId)
      .populate("requesterId", "first_name last_name email")
      .populate("processingAdminId", "first_name last_name email")
      .populate("organizationId");

    if (!request) {
      throw new ErrorResponse("Organization request not found", 404);
    }

    return request;
  }

  // Get all requests by a specific user for that user
  public async getUserOrganizationRequests(
    userId: string
  ): Promise<IOrganizationRequest[]> {
    return OrganizationRequest.find({ requesterId: userId })
      .sort({ createdAt: -1 })
      .select("-processingAdminId -__v")
      .lean();
  }

  public async getRequests(
    filters: RequestFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<RequestsResult> {
    const {
      status,
      fromDate,
      toDate,
      requesterEmail,
      ownerEmail,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;
    const { page, limit } = pagination;
    const query: any = {};

    // Apply status filter
    if (status) {
      query.status = Array.isArray(status) ? { $in: status } : status;
    }

    // Apply date range filter
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) query.createdAt.$lte = toDate;
    }

    // Apply requester email filter if specified
    if (requesterEmail) {
      // Find the user IDs for the specified requester email
      const requesters = await User.find({
        email: { $regex: new RegExp(requesterEmail, "i") },
      }).select("_id");

      if (requesters.length > 0) {
        const requesterIds = requesters.map((requester) => requester._id);
        query.requesterId = { $in: requesterIds };
      } else {
        // If no match, return empty result
        return {
          total: 0,
          page,
          pages: 0,
          requests: [],
        };
      }
    }

    // Apply owner email filter if specified
    if (ownerEmail) {
      query.ownerEmail = { $regex: new RegExp(ownerEmail, "i") };
    }

    // Count total before applying pagination
    const total = await OrganizationRequest.countDocuments(query);
    const pages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Build sort object
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Fetch paginated results with sorting
    const requests = await OrganizationRequest.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate("requesterId", "first_name last_name email")
      .populate("processingAdminId", "first_name last_name email");

    return {
      total,
      page,
      pages,
      requests,
    };
  }

  public async resetStuckProcessingRequests(
    timeoutHours: number = 2
  ): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - timeoutHours);

    const result = await OrganizationRequest.updateMany(
      {
        status: "processing",
        processingStartedAt: { $lt: cutoffTime },
      },
      {
        $set: { status: "pending" },
        $unset: { processingAdminId: "", processingStartedAt: "" },
      }
    );

    return result.modifiedCount;
  }
}
