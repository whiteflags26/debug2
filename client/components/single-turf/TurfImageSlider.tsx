"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface TurfImageSliderProps {
  images: string[];
}

const TurfImageSlider: React.FC<TurfImageSliderProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleDotClick = (index: number) => setCurrent(index);

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left") {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  if (!images.length) {
    return (
      <Card className="w-full overflow-hidden bg-slate-100">
        <AspectRatio ratio={16 / 9}>
          <div className="flex items-center justify-center h-full text-slate-400">
            No images available
          </div>
        </AspectRatio>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full rounded-lg overflow-hidden"
    >
      <Card className="overflow-hidden border-slate-200">
        <AspectRatio ratio={16 / 9}>
          <AnimatePresence initial={false} mode="wait">
            <motion.img
              key={images[current]}
              src={images[current]}
              alt={`Turf Image ${current + 1}`}
              className="object-cover w-full h-full transition-transform hover:scale-105"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onTouchStart={(e) =>
                (e.currentTarget.dataset.startX = String(e.touches[0].clientX))
              }
              onTouchEnd={(e) => {
                const startX = Number(e.currentTarget.dataset.startX);
                const diff = e.changedTouches[0].clientX - startX;
                if (Math.abs(diff) > 50) {
                  handleSwipe(diff < 0 ? "left" : "right");
                }
              }}
            />
          </AnimatePresence>
        </AspectRatio>
      </Card>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm border-slate-200 hover:border-slate-300"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-4 w-4 text-slate-700" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white backdrop-blur-sm border-slate-200 hover:border-slate-300"
        onClick={nextSlide}
      >
        <ChevronRight className="h-4 w-4 text-slate-700" />
      </Button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 w-full flex justify-center items-center gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={cn(
              "transition-all duration-300 rounded-full shadow-sm border border-white/20",
              index === current
                ? "bg-white w-3 h-3"
                : "bg-white/60 hover:bg-white/80 w-2 h-2"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TurfImageSlider;
