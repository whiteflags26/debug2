import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../shared/middleware/async';
import ErrorResponse from '../../utils/errorResponse';
import FacilityService from './facility.service';
import validator from 'validator';
import { AuthRequest } from '../auth/auth.middleware';
import { AuthenticatedRequest } from '../../types/request';

export default class FacilityController {
  private readonly facilityService: FacilityService;
  constructor() {
    this.facilityService = new FacilityService();
  }

  /**
   * @route POST /api/v1/facilities
   * @desc Create a new facility entry
   * @access Private/Admin
   */
  createFacility = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { name } = req.body;

      if (!name) {
        return next(new ErrorResponse("Name is required", 400));
      }

      // Sanitize and validate name
      const sanitizedName = validator.trim(name);
      if (sanitizedName.length === 0) {
        return next(new ErrorResponse("Facility name cannot be empty", 400));
      }

      // Additional validation if needed
      if (!validator.isLength(sanitizedName, { min: 2, max: 50 })) {
        return next(new ErrorResponse("Facility name must be between 2 and 50 characters", 400));
      }

      const finalsSnitizedName = sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1).toLowerCase();

      const facility = await this.facilityService.createFacility({ 
        name: finalsSnitizedName 
      });

      res.status(201).json({
        success: true,
        data: facility,
        message: 'Facility created successfully',
      });
    }
  );

  /**
   * @route GET /api/v1/facilities
   * @desc Retrieve all facility entries
   * @access Public
   */
  getAllFacilities = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const facilities = await this.facilityService.getAllFacilities();

      res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities,
      });
    }
  );

  /**
   * @route GET /api/v1/facilities/:id
   * @desc Retrieve a specific facility by ID
   * @access Public
   */
  getFacilityById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Facility ID format', 404));
      }
      
      const facility = await this.facilityService.getFacilityById(id);
      if (!facility) {
        return next(new ErrorResponse('Facility not found', 404));
      }

      res.status(200).json({
        success: true,
        data: facility,
      });
    }
  );

  /**
   * @route PUT /api/v1/facilities/:id
   * @desc Update a facility entry by ID
   * @access Private/Admin
   */
  updateFacility = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { name } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Facility ID format', 404));
      }

      if (!name) {
        return next(new ErrorResponse("Name is required", 400));
      }

      // Sanitize and validate name
      const sanitizedName = validator.trim(name);
      if (sanitizedName.length === 0) {
        return next(new ErrorResponse("Facility name cannot be empty", 400));
      }

      // Additional validation if needed
      if (!validator.isLength(sanitizedName, { min: 2, max: 50 })) {
        return next(new ErrorResponse("Facility name must be between 2 and 50 characters", 400));
      }

      const finalsSnitizedName = sanitizedName.charAt(0).toUpperCase() + sanitizedName.slice(1).toLowerCase();

      const facility = await this.facilityService.updateFacility(id, { 
        name: finalsSnitizedName 
      });
      
      if (!facility) {
        return next(new ErrorResponse('Facility not found', 404));
      }

      res.status(200).json({
        success: true,
        data: facility,
        message: 'Facility updated successfully',
      });
    }
  );

  /**
   * @route DELETE /api/v1/facilities/:id
   * @desc Delete a facility entry by ID
   * @access Private/Admin
   */
  deleteFacility = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Facility ID format', 404));
      }

      const facility = await this.facilityService.deleteFacility(id);
      if (!facility) {
        return next(new ErrorResponse('Facility not found', 404));
      }

      res.status(200).json({
        success: true,
        data: facility,
        message: 'Facility deleted successfully',
      });
    }
  );
}