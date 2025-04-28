import ErrorResponse from "../../utils/errorResponse";
import { ITeamSize, TeamSize } from "./team_size.model";
import { Turf } from "../turf/turf.model";
import mongoose from "mongoose";

export default class TeamSizeService {
    /**
     * @desc Create new team size entry
     **/
    async createTeamSize(teamSizeData: Partial<ITeamSize>): Promise<ITeamSize> {
        try {
            const teamSize = new TeamSize(teamSizeData);
            return await teamSize.save();
        } catch (error) {
            console.error(error);
            throw new ErrorResponse("Failed to create team size", 500);
        }
    }

    /**
     * @desc Retrieve all team size entries
     **/
    async getAllTeamSizes(): Promise<ITeamSize[]> {
        return await TeamSize.find();
    }

    /**
     * @desc Retrieve team size by ID
     **/
    async getTeamSizeById(id: string): Promise<ITeamSize | null> {
        return await TeamSize.findById(id);
    }

    /**
     * @desc Update team size by ID and update all turfs using it
     * Uses a transaction to ensure all updates are atomic
     **/
    async updateTeamSize(id: string, updateData: Partial<ITeamSize>): Promise<ITeamSize | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get the original team size before updating
            const originalTeamSize = await TeamSize.findById(id);
            if (!originalTeamSize) {
                throw new ErrorResponse("Team size not found", 404);
            }

            // Update the team size document
            const updatedTeamSize = await TeamSize.findByIdAndUpdate(id, updateData, {
                new: true,
                runValidators: true,
                session
            });

            // If the name (number) has changed, update all turfs using this team size
            if (updateData.name && updateData.name !== originalTeamSize.name) {
                // Find all turfs with this team size
                const turfsToUpdate = await Turf.find({ team_size: originalTeamSize.name });
                
                // Update each turf's team_size
                for (const turf of turfsToUpdate) {
                    turf.team_size = updateData.name as number;
                    await turf.save({ session });
                }
            }

            await session.commitTransaction();
            return updatedTeamSize;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error updating team size:", error);
            throw new ErrorResponse(
                error instanceof ErrorResponse 
                ? error.message 
                : "Failed to update team size", 
                error instanceof ErrorResponse ? error.statusCode : 500
            );
        } finally {
            session.endSession();
        }
    }

    /**
     * @desc Delete team size by ID
     * Prevents deletion if any turf has this as its only team size option
     * Uses a transaction to ensure atomicity
     **/
    async deleteTeamSize(id: string): Promise<ITeamSize | null> {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Get the team size to be deleted
            const teamSizeToDelete = await TeamSize.findById(id);
            if (!teamSizeToDelete) {
                throw new ErrorResponse("Team size not found", 404);
            }

            // Find turfs that have only this team size
            const turfsWithOnlyThisTeamSize = await Turf.find({
                team_size: teamSizeToDelete.name,
            });

            // Check if there are turfs with only this team size
            if (turfsWithOnlyThisTeamSize.length > 0) {
                const turfNames = turfsWithOnlyThisTeamSize.map(turf => turf.name).join(", ");
                throw new ErrorResponse(
                    `Cannot delete team size ${teamSizeToDelete.name} as it is the only team size for the following turfs: ${turfNames}`,
                    400
                );
            }

            // Delete the team size
            const deletedTeamSize = await TeamSize.findByIdAndDelete(id, { session });
            
            // Update any turfs that use this team size (should be none based on our check)
            await Turf.updateMany(
                { team_size: teamSizeToDelete.name },
                { $set: { team_size: null } },
                { session }
            );

            await session.commitTransaction();
            return deletedTeamSize;
        } catch (error) {
            await session.abortTransaction();
            console.error("Error deleting team size:", error);
            throw new ErrorResponse(
                error instanceof ErrorResponse 
                ? error.message 
                : "Failed to delete team size", 
                error instanceof ErrorResponse ? error.statusCode : 500
            );
        } finally {
            session.endSession();
        }
    }

    /**
     * @desc Validate if team sizes exist by numbers
     * @param teamSizeNumbers - Array of team size numbers to validate
     * @throws ErrorResponse if any team size doesn't exist
     */
    public async validateTeamSizes(teamSizeNumbers: number[]): Promise<void> {
        for (const teamSizeNumber of teamSizeNumbers) {
            const teamSizeExists = await TeamSize.findOne({ name: teamSizeNumber });
            if (!teamSizeExists) {
                throw new ErrorResponse(`Team size '${teamSizeNumber}' does not exist`, 400);
            }
        }
    }
}