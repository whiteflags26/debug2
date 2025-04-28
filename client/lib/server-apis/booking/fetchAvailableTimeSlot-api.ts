import { ITimeSlot } from "@/types/timeslot";
import { format } from "date-fns";

interface FetchAvailableTimeSlotsResponse {
  success: boolean;
  data: ITimeSlot[];
}

export const fetchAvailableTimeSlots = async (
  turfId: string,
  selectedDate: Date
): Promise<FetchAvailableTimeSlotsResponse> => {
  try {
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/timeslot/available/${turfId}?date=${formattedDate}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching time slots:", error);
    return {
      success: false,
      data: [],
    };
  }
};