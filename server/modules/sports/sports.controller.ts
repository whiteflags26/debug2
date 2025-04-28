import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../shared/middleware/async';
import ErrorResponse from '../../utils/errorResponse';
import SportsService from './sports.service';
import { AuthenticatedRequest } from '../../types/request';

export default class SportsController {
  private readonly sportsService: SportsService;
  constructor() {
    this.sportsService = new SportsService();
  }

  /**
   * @route POST /api/v1/sports
   * @desc Create a new sports entry
   * @access Private/Admin
   */
  createSports = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { name } = req.body;
  
      if (!name) {
        return next(new ErrorResponse("Name is required", 400));
      }
  
      // Sanitize name: capitalize first letter, lowercase the rest
      const sanitizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  
      const sports = await this.sportsService.createSports({ name: sanitizedName });
  
      res.status(201).json({
        success: true,
        data: sports,
      });
    }
  );

  /**
   * @route GET /api/v1/sports
   * @desc Retrieve all sports entries
   * @access Public
   */
  getAllSports = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const sports = await this.sportsService.getAllSports();

      res.status(200).json({
        success: true,
        count: sports.length,
        data: sports,
      });
    }
  );

  /**
   * @route GET /api/v1/sports/:id
   * @desc Retrieve a specific sports by ID
   * @access Public
   */
  getSportsById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Sports ID format', 404));
      }
      
      const sports = await this.sportsService.getSportsById(id);
      if (!sports) {
        return next(new ErrorResponse('Sports not found', 404));
      }

      res.status(200).json({
        success: true,
        data: sports,
      });
    }
  );

  /**
   * @route PUT /api/v1/sports/:id
   * @desc Update a sports entry by ID
   * @access Private/Admin
   */
  updateSports = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { name } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Sports ID format', 404));
      }
  
      if (!name) {
        return next(new ErrorResponse("Name is required", 400));
      }
  
      // Sanitize name: capitalize first letter, lowercase the rest
      const sanitizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  
      const sports = await this.sportsService.updateSports(id, { name: sanitizedName });
      if (!sports) {
        return next(new ErrorResponse('Sports not found', 404));
      }
  
      res.status(200).json({
        success: true,
        data: sports,
        message: 'Sports updated successfully',
      });
    }
  );

  /**
   * @route DELETE /api/v1/sports/:id
   * @desc Delete a sports entry by ID
   * @access Private/Admin
   */
  deleteSports = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid Sports ID format', 404));
      }

      const sports = await this.sportsService.deleteSports(id);
      if (!sports) {
        return next(new ErrorResponse('Sports not found', 404));
      }

      res.status(200).json({
        success: true,
        data: sports,
        message: 'Sports deleted successfully',
      });
    }
  );
}