import { NextFunction, Request, Response } from "express";
import asyncHandler from "../../shared/middleware/async";
import ErrorResponse from "../../utils/errorResponse";
import TimeSlotService from "./timeslot.service";

export default class TimeSlotController {
  private readonly timeSlotService: TimeSlotService;

  constructor() {
    this.timeSlotService = new TimeSlotService();
  }
  generateTimeSlot = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { turfId, startDate, endDate, slotDuration } = req.body;
      const slots = await this.timeSlotService.generateTimeSlots(
        turfId,
        new Date(startDate),
        new Date(endDate),
        slotDuration
      );
      res.status(201).json({ success: true, data: slots });
    }
  );

  getTimeSlot = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const filter = req.query;
      const slots = await this.timeSlotService.getTimeSlots(filter);
      res.status(200).json({ success: true, data: slots });
    }
  );

  getAvailableTimeSlot = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { turfId } = req.params;
      const date = req.query.date
        ? new Date(req.query.date as string)
        : new Date();
      const slots = await this.timeSlotService.getAvailableTimeSlots(
        turfId,
        date
      );
      res.status(200).json({ success: true, data: slots });
    }
  );

  updateTimeSlot = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const updateData = req.body;
      const slot = await this.timeSlotService.updateTimeSlot(id, updateData);
      if (!slot) return next(new ErrorResponse("slot not found", 404));
      res.status(200).json({ success: true, data: slot });
    }
  );

  deleteTimeSlot = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const filters = req.query;
      const result = await this.timeSlotService.deleteTimeSlots(filters);

      res.status(200).json({ success: true, data: result });
    }
  );
}
