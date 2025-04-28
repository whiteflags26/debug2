"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import BookingModal from "@/components/booking/BookingModal";

interface BookingButtonProps {
  turfId: string;
}

export default function BookingButton({ turfId }: BookingButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg flex items-center gap-2 px-6 py-6 bg-primary hover:bg-primary/90 transition-all z-50"
        onClick={() => setIsModalOpen(true)}
      >
        <CalendarClock size={20} />
        <span className="font-medium">Start Booking</span>
      </Button>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        turfId={turfId}
      />
    </>
  );
}
