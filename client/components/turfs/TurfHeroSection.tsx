import { BackgroundSlider } from "@/components/turfs/BackGroundSlider";
import { SearchForm } from "@/components/turfs/SearchForm";

export default function TurfHeroSection() {
  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden mb-8 sm:mb-12 mx-auto rounded-md">
      {/* Background Slider */}
      <BackgroundSlider />
      
      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="animate-fade-in space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
              Find Your Perfect
            </span>
            <br />
            <span className="text-white">Sports Turf</span>
          </h1>
          
          <p className="text-slate-200 max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light leading-relaxed">
            Discover and book the best sports turfs in your area. 
            <span className="hidden sm:inline"> Filter by sport, price, and location to find the perfect match for your game.</span>
          </p>

          <SearchForm />

          <div className="hidden sm:flex items-center justify-center gap-4 md:gap-8 mt-6 text-white/80 text-xs sm:text-sm">
            <div className="flex items-center">
              <span className="font-semibold mr-2">100+</span> Locations
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">50K+</span> Happy Players
            </div>
            <div className="flex items-center">
              <span className="font-semibold mr-2">4.8</span> Average Rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
