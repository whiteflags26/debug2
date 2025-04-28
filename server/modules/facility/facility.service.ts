import mongoose from "mongoose";
import ErrorResponse from "../../utils/errorResponse";
import { IFacility, Facility } from "./facility.model";
import Organization from "../organization/organization.model";

export default class FacilityService {
  /**
   * @desc Create new facility entry
   **/
  async createFacility(facilityData: Partial<IFacility>): Promise<IFacility> {
    try {
      const facility = new Facility(facilityData);
      return await facility.save();
    } catch (error) {
      console.error(error);
      throw new ErrorResponse("Failed to create facility", 500);
    }
  }

  /**
   * @desc Retrieve all facility entries
   **/
  async getAllFacilities(): Promise<IFacility[]> {
    return await Facility.find();
  }

  /**
   * @desc Retrieve facility by ID
   **/
  async getFacilityById(id: string): Promise<IFacility | null> {
    return await Facility.findById(id);
  }

  /**
   * @desc Update facility by ID
   * @param id - ID of the facility to update
   * @param updateData - Updated facility data
   * @returns Updated facility
   * 
   * This method will also update any organizations that reference this facility
   * by name, ensuring consistency across collections
   **/
  async updateFacility(id: string, updateData: Partial<IFacility>): Promise<IFacility | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // First, find the current facility to get its name
      const currentFacility = await Facility.findById(id).session(session);
      
      if (!currentFacility) {
        throw new ErrorResponse("Facility not found", 404);
      }
      
      // Update the facility with the new data
      const updatedFacility = await Facility.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
        session
      });
      
      // If the name is being updated, update all organization references
      if (updateData.name && currentFacility.name !== updateData.name) {
        const oldName = currentFacility.name;
        const newName = updateData.name;
        
        // Update all organizations that reference this facility
        const updateResult = await Organization.updateMany(
          { facilities: oldName },
          { $set: { "facilities.$[elem]": newName } },
          { 
            arrayFilters: [{ elem: oldName }],
            session
          }
        );
        
        console.log(`Updated facility name in ${updateResult.modifiedCount} organizations`);
      }
      
      await session.commitTransaction();
      return updatedFacility;
    } catch (error) {
      await session.abortTransaction();
      console.error("Error updating facility:", error);
      throw new ErrorResponse(
        error instanceof ErrorResponse ? error.message : "Failed to update facility", 
        error instanceof ErrorResponse ? error.statusCode : 500
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * @desc Delete facility by ID
   * @param id - ID of the facility to delete
   * @returns Deleted facility
   * 
   * This method will also remove references to this facility from all organizations.
   * It will abort if any organization would be left with no facilities.
   **/
  async deleteFacility(id: string): Promise<IFacility | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // First, find the facility to get its name
      const facility = await Facility.findById(id).session(session);
      
      if (!facility) {
        throw new ErrorResponse("Facility not found", 404);
      }
      
      const facilityName = facility.name;
      
      // Find any organizations that would be left with zero facilities
      const organizationsWithOnlyThisFacility = await Organization.find({
        facilities: { $size: 1, $all: [facilityName] }
      }).session(session);
      
      if (organizationsWithOnlyThisFacility.length > 0) {
        const orgNames = organizationsWithOnlyThisFacility.map(org => org.name).join(", ");
        throw new ErrorResponse(
          `Cannot delete facility: Organizations (${orgNames}) would be left with no facilities`,
          400
        );
      }
      
      // Remove this facility from all organizations' facilities arrays
      await Organization.updateMany(
        { facilities: facilityName },
        { $pull: { facilities: facilityName } },
        { session }
      );
      
      // Delete the facility
      const deletedFacility = await Facility.findByIdAndDelete(id).session(session);
      
      await session.commitTransaction();
      return deletedFacility;
    } catch (error) {
      await session.abortTransaction();
      console.error("Error deleting facility:", error);
      throw new ErrorResponse(
        error instanceof ErrorResponse ? error.message : "Failed to delete facility", 
        error instanceof ErrorResponse ? error.statusCode : 500
      );
    } finally {
      session.endSession();
    }
  }

  /**
   * @desc Get facility by name
   * @param name - The name of the facility to retrieve
   * @returns Facility object or null if not found
   **/
  public async validateFacilities(facilities: string[]): Promise<void> {
    for (const facilityName of facilities) {
      const facilityExists = await Facility.findOne({ name: facilityName });
      if (!facilityExists) {
        throw new ErrorResponse(`Facility '${facilityName}' does not exist`, 400);
      }
    }
  }
}