import mongoose from "mongoose";
import ErrorResponse from "../../utils/errorResponse";
import { ISports, Sports } from "./sports.model";
import { Turf } from "../turf/turf.model";

export default class SportsService {
    /**
     * @desc Create new sports entry
     **/
    async createSports(sportsData: Partial<ISports>): Promise<ISports> {
        try {
            const sports = new Sports(sportsData);
            return await sports.save();
        } catch (error) {
            console.error(error);
            throw new ErrorResponse("Failed to create sports", 500);
        }
    }

    /**
     * @desc Retrieve all sports entries
     **/
    async getAllSports(): Promise<ISports[]> {
        return await Sports.find();
    }

    /**
     * @desc Retrieve sports by ID
     **/
    async getSportsById(id: string): Promise<ISports | null> {
        return await Sports.findById(id);
    }

    /**
     * @desc Update sports by ID
     * @param id - ID of the sport to update
     * @param updateData - Updated sport data
     * @returns Updated sport
     * 
     * This method will also update any turfs that reference this sport,
     * ensuring consistency across collections
     **/
    async updateSports(id: string, updateData: Partial<ISports>): Promise<ISports | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // First, find the current sport to get its name
            const currentSport = await Sports.findById(id).session(session);
            
            if (!currentSport) {
                throw new ErrorResponse("Sport not found", 404);
            }
            
            // Update the sport with the new data
            const updatedSport = await Sports.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
                session
            });
            
            // If the name is being updated, update all turf references
            if (updateData.name && currentSport.name !== updateData.name) {
                const oldName = currentSport.name;
                const newName = updateData.name;
                
                // Update all turfs that reference this sport
                const updateResult = await Turf.updateMany(
                    { sports: oldName },
                    { $set: { "sports.$[elem]": newName } },
                    { 
                        arrayFilters: [{ elem: oldName }],
                        session
                    }
                );
                
                console.log(`Updated sport name in ${updateResult.modifiedCount} turfs`);
            }
            
            await session.commitTransaction();
            return updatedSport;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error updating sport:", error);
            throw new ErrorResponse(
                error instanceof ErrorResponse ? error.message : "Failed to update sport", 
                error instanceof ErrorResponse ? error.statusCode : 500
            );
        } finally {
            session.endSession();
        }
    }

    /**
     * @desc Delete sports by ID
     * @param id - ID of the sport to delete
     * @returns Deleted sport
     * 
     * This method will also check if any turf would be left with no sports.
     * It will abort if any turf would be left with no sports.
     **/
    async deleteSports(id: string): Promise<ISports | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // First, find the sport to get its name
            const sport = await Sports.findById(id).session(session);
            
            if (!sport) {
                throw new ErrorResponse("Sport not found", 404);
            }
            
            const sportName = sport.name;
            
            // Find any turfs that would be left with zero sports
            const turfsWithOnlyThisSport = await Turf.find({
                sports: { $size: 1, $all: [sportName] }
            }).session(session);
            
            if (turfsWithOnlyThisSport.length > 0) {
                const turfNames = turfsWithOnlyThisSport.map(turf => turf.name).join(", ");
                throw new ErrorResponse(
                    `Cannot delete sport: Turfs (${turfNames}) would be left with no sports`,
                    400
                );
            }
            
            // Remove this sport from all turfs' sports arrays
            await Turf.updateMany(
                { sports: sportName },
                { $pull: { sports: sportName } },
                { session }
            );
            
            // Delete the sport
            const deletedSport = await Sports.findByIdAndDelete(id).session(session);
            
            await session.commitTransaction();
            return deletedSport;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error deleting sport:", error);
            throw new ErrorResponse(
                error instanceof ErrorResponse ? error.message : "Failed to delete sport", 
                error instanceof ErrorResponse ? error.statusCode : 500
            );
        } finally {
            session.endSession();
        }
    }

    /**
     * @desc Validate if sports exist by names
     * @param sportsNames - Array of sport names to validate
     * @throws ErrorResponse if any sport doesn't exist
     */
    public async validateSports(sportsNames: string[]): Promise<void> {
        for (const sportName of sportsNames) {
            const sportExists = await Sports.findOne({ name: sportName });
            if (!sportExists) {
                throw new ErrorResponse(`Sport '${sportName}' does not exist`, 400);
            }
        }
    }
}