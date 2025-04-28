import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import asyncHandler from '../../shared/middleware/async';
import ErrorResponse from '../../utils/errorResponse';
import TeamSizeService from './team_size.service';
import { AuthenticatedRequest } from '../../types/request';

export default class TeamSizeController {
  private readonly teamSizeService: TeamSizeService;
  constructor() {
    this.teamSizeService = new TeamSizeService();
  }

  /**
   * @route POST /api/v1/team-sizes
   * @desc Create a new team size entry
   * @access Private/Admin
   */
  createTeamSize = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { name } = req.body;
  
      if (name === undefined) {
        return next(new ErrorResponse("Number is required", 400));
      }
      
      // Validate that it's a positive number
      const teamSizeNumber = Number(name);
      if (isNaN(teamSizeNumber) || teamSizeNumber < 1) {
        return next(new ErrorResponse("Team size number must be a positive number", 400));
      }
  
      const teamSize = await this.teamSizeService.createTeamSize({ name: teamSizeNumber });
  
      res.status(201).json({
        success: true,
        data: teamSize,
      });
    }
  );

  /**
   * @route GET /api/v1/team-sizes
   * @desc Retrieve all team size entries
   * @access Public
   */
  getAllTeamSizes = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const teamSizes = await this.teamSizeService.getAllTeamSizes();

      res.status(200).json({
        success: true,
        count: teamSizes.length,
        data: teamSizes,
      });
    }
  );

  /**
   * @route GET /api/v1/team-sizes/:id
   * @desc Retrieve a specific team size by ID
   * @access Public
   */
  getTeamSizeById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid TeamSize ID format', 404));
      }
      
      const teamSize = await this.teamSizeService.getTeamSizeById(id);
      if (!teamSize) {
        return next(new ErrorResponse('TeamSize not found', 404));
      }

      res.status(200).json({
        success: true,
        data: teamSize,
      });
    }
  );

  /**
   * @route PUT /api/v1/team-sizes/:id
   * @desc Update a team size entry by ID
   * @access Private/Admin
   */
  updateTeamSize = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const { name } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid TeamSize ID format', 404));
      }
  
      if (name === undefined) {
        return next(new ErrorResponse("Number is required", 400));
      }
      
      // Validate that it's a positive number
      const teamSizeNumber = Number(name);
      if (isNaN(teamSizeNumber) || teamSizeNumber < 1) {
        return next(new ErrorResponse("Team size number must be a positive number", 400));
      }
  
      const teamSize = await this.teamSizeService.updateTeamSize(id, { name: teamSizeNumber });
      if (!teamSize) {
        return next(new ErrorResponse('TeamSize not found', 404));
      }
  
      res.status(200).json({
        success: true,
        data: teamSize,
        message: 'TeamSize updated successfully',
      });
    }
  );

  /**
   * @route DELETE /api/v1/team-sizes/:id
   * @desc Delete a team size entry by ID
   * @access Private/Admin
   */
  deleteTeamSize = asyncHandler(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ErrorResponse('Invalid TeamSize ID format', 404));
      }

      const teamSize = await this.teamSizeService.deleteTeamSize(id);
      if (!teamSize) {
        return next(new ErrorResponse('TeamSize not found', 404));
      }

      res.status(200).json({
        success: true,
        data: teamSize,
        message: 'TeamSize deleted successfully',
      });
    }
  );
}