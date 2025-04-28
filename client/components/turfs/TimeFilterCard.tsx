import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";

export default function TimeFilterCard({
  onFilterApply,
}: {
  onFilterApply: (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([20, 44]); // default: 10:00 - 22:00

  const handleApplyFilter = () => {
    if (!selectedDate) return;

    const [startValue, endValue] = timeRange;

    const startHour = Math.floor(startValue / 2)
      .toString()
      .padStart(2, "0");
    const startMin = startValue % 2 === 0 ? "00" : "30";

    const endHour = Math.floor(endValue / 2)
      .toString()
      .padStart(2, "0");
    const endMin = endValue % 2 === 0 ? "00" : "30";

    onFilterApply({
      date: format(selectedDate, "yyyy-MM-dd"),
      startTime: `${startHour}:${startMin}`,
      endTime: `${endHour}:${endMin}`,
    });
  };

  const disablePastDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Card className="p-4 w-full max-w-md">
      <CardContent className="flex flex-col gap-6">
        <div>
          <Label className="text-lg">Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate || undefined}
            onSelect={(date) => setSelectedDate(date || null)}
            disabled={disablePastDates}
          />
        </div>

        {selectedDate && (
          <div>
            <Label className="text-lg block mb-2">Select Time Range</Label>
            <DualRangeSlider
              min={0}
              max={47} // 24 hours split into 30 min steps
              step={1}
              value={timeRange}
              onValueChange={(val) => setTimeRange(val as [number, number])}
            />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>
                Start:{" "}
                {`${Math.floor(timeRange[0] / 2)
                  .toString()
                  .padStart(2, "0")}:${timeRange[0] % 2 === 0 ? "00" : "30"}`}
              </span>
              <span>
                End:{" "}
                {`${Math.floor(timeRange[1] / 2)
                  .toString()
                  .padStart(2, "0")}:${timeRange[1] % 2 === 0 ? "00" : "30"}`}
              </span>
            </div>
          </div>
        )}

        {selectedDate && (
          <Button onClick={handleApplyFilter} className="mt-4 w-full">
            Apply Filter
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
