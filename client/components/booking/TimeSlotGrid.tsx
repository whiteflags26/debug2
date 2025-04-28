
import { format } from 'date-fns';
import { cn } from '@/lib/utils/utils';
import { ITimeSlot } from '@/types/timeslot';

interface TimeSlotGridProps {
  timeSlots: ITimeSlot[];
  selectedSlot: ITimeSlot | null;
  onSelect: (slot: ITimeSlot) => void;
}

export default function TimeSlotGrid({ timeSlots, selectedSlot, onSelect }: TimeSlotGridProps) {
  const formatTime = (date: Date | string) => {
    return format(new Date(date), 'h:mm a');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {timeSlots.map((slot) => (
        <button
          key={slot._id}
          className={cn(
            "py-2 px-3 rounded-md text-sm font-medium transition-colors",
            "border hover:bg-primary/10",
            selectedSlot?._id === slot._id 
              ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary" 
              : "bg-background text-foreground border-input"
          )}
          onClick={() => onSelect(slot)}
        >
          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
          {slot.price_override && (
            <div className="text-xs font-normal mt-1">
              ${slot.price_override.toFixed(2)}
            </div>  
          )}
        </button>
      ))}
    </div>
  );
}