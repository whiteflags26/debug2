import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, MapPin, Users, Lightbulb, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DualRangeSlider } from "@/components/ui/dual-range-slider";
import TimeFilterCard from "@/components/turfs/TimeFilterCard";
import { autocomplete } from "barikoiapis";
import "@/lib/config/barikoiConfig";
import { ITurf } from "@/types/turf";
import { ITurfFilters } from "@/types/turfFilter";
import { SetPagination } from "@/types/pagination";
import { reverseGeocode } from "@/lib/server-apis/barikoi/reverseGeocode-api";
import { IBarikoiSuggestion } from "@/types/barikoi";
import { TeamSize, Sport, Facility } from "@/types/turfFilterData";
import { fetchAllFilterData } from "@/lib/server-apis/turf/fetchTurfsWithFilter-api";

interface Props {
  turfs: ITurf[];
  filters: ITurfFilters;
  setFilters: Dispatch<SetStateAction<ITurfFilters>>;
  showFilters: boolean;
  setShowFilters: Dispatch<SetStateAction<boolean>>;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setPagination: SetPagination;
}

const filterVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: "auto" },
};

export default function TurfFilters({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  activeTab,
  setActiveTab,
  setPagination,
}: Props) {
  // State for API data
  const [teamSizes, setTeamSizes] = useState<TeamSize[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for location search
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<IBarikoiSuggestion[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAllFilterData();
        setTeamSizes(data.teamSizes);
        setSports(data.sports);
        setFacilities(data.facilities);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSportFilter = (sport: string) => {
    setActiveTab(sport.toLowerCase());
    setFilters({ ...filters, sports: sport === "all" ? [] : [sport] });
    setPagination((prev: { currentPage: number; totalPages: number }) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toString();
          const lon = pos.coords.longitude.toString();

          // Update filters with coordinates
          setFilters({
            ...filters,
            latitude: lat,
            longitude: lon,
          });

          // Get address from coordinates
          const result = await reverseGeocode(lat, lon);
          if (result && result.place && result.place.address) {
            setQuery(result.place.address);
          } else {
            setQuery(`${lat}, ${lon}`);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Please enable location access to use this feature");
        }
      );
    }
  };

  const handleTimeFilter = (data: {
    date: string;
    startTime: string;
    endTime: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      preferredDate: data.date,
      preferredTimeStart: data.startTime,
      preferredTimeEnd: data.endTime,
    }));
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setLocationLoading(false);
        return;
      }
      setLocationLoading(true);
      try {
        const res = await autocomplete({ q: query });
        setSuggestions(res.places || []);
      } catch (err) {
        console.error("Barikoi error:", err);
        setSuggestions([]);
      } finally {
        setLocationLoading(false);
      }
    };

    const timeout = setTimeout(fetchSuggestions, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  const handleLocationSelect = (place: IBarikoiSuggestion) => {
    setFilters({
      ...filters,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString(),
    });
    setQuery(place.address);
    setSuggestions([]);
  };

  // Sort sports alphabetically
  const sortedSports = [...sports].sort((a, b) => a.name.localeCompare(b.name));

  // Sort team sizes numerically
  const sortedTeamSizes = [...teamSizes].sort(
    (a, b) => parseInt(a.name) - parseInt(b.name)
  );

  return (
    <div className="mb-8">
      <Tabs defaultValue="all" value={activeTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-slate-100">
            <TabsTrigger value="all" onClick={() => handleSportFilter("all")}>
              All Turfs
            </TabsTrigger>
            {sortedSports.map((sport) => (
              <TabsTrigger
                key={sport._id}
                value={sport.name.toLowerCase()}
                onClick={() => handleSportFilter(sport.name)}
              >
                {sport.name.charAt(0).toUpperCase() +
                  sport.name.slice(1).toLowerCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              {showFilters ? <X size={16} /> : <Filter size={16} />}
              <span className="hidden sm:inline">
                {showFilters ? "Hide Filters" : "More Filters"}
              </span>
            </Button>
          </div>
        </div>
      </Tabs>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            variants={filterVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mb-8 overflow-hidden"
          >
            <div className="flex justify-end mb-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setFilters({
                    sports: [],
                    teamSize: [],
                    facilities: [],
                    minPrice: "0",
                    maxPrice: "10000",
                    preferredDate: "",
                    preferredTimeStart: "",
                    preferredTimeEnd: "",
                    latitude: "",
                    longitude: "",
                    radius: "",
                  });
                  setPagination(
                    (prev: { currentPage: number; totalPages: number }) => ({
                      ...prev,
                      currentPage: 1,
                    })
                  );
                  setQuery("");
                  setSuggestions([]);
                }}
              >
                Clear Filters
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <svg
                      className="w-8 h-8 text-slate-500 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                      ></path>
                    </svg>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Price Range */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <span className="bg-green-100 p-1.5 rounded-full">
                          ৳
                        </span>{" "}
                        Price Range
                      </h3>
                      <div className="px-2">
                        <DualRangeSlider
                          min={0}
                          max={10000}
                          step={100}
                          value={[
                            Number(filters.minPrice) || 0,
                            Number(filters.maxPrice) || 5000,
                          ]}
                          onValueChange={(val) => {
                            setFilters({
                              ...filters,
                              minPrice: val[0].toString(),
                              maxPrice: val[1].toString(),
                            });
                          }}
                        />
                        <div className="flex justify-between mt-2 text-sm text-slate-500">
                          <span>৳{filters.minPrice || "0"}</span>
                          <span>৳{filters.maxPrice || "10000"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Team Size */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Users size={15} /> Team Size
                      </h3>
                      <div className="grid grid-cols-5 gap-2">
                        {sortedTeamSizes.map((size) => (
                          <Button
                            key={size._id}
                            variant={
                              filters.teamSize.includes(size.name)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => {
                              const newTeamSize = filters.teamSize.includes(
                                size.name
                              )
                                ? filters.teamSize.filter(
                                    (s: string) => s !== size.name
                                  )
                                : [...filters.teamSize, size.name];

                              setFilters({
                                ...filters,
                                teamSize: newTeamSize,
                              });
                              setPagination(
                                (prev: {
                                  currentPage: number;
                                  totalPages: number;
                                }) => ({
                                  ...prev,
                                  currentPage: 1,
                                })
                              );
                            }}
                          >
                            {size.name}v{size.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Facilities */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Lightbulb size={15} /> Facilities
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {facilities.map((facility) => (
                          <Button
                            key={facility._id}
                            variant={
                              filters.facilities.includes(facility.name)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="whitespace-normal break-words text-xs px-3 py-2 text-center h-auto min-w-[6rem] max-w-[10rem]"
                            onClick={() => {
                              const updatedFacilities =
                                filters.facilities.includes(facility.name)
                                  ? filters.facilities.filter(
                                      (f) => f !== facility.name
                                    )
                                  : [...filters.facilities, facility.name];

                              setFilters({
                                ...filters,
                                facilities: updatedFacilities,
                              });
                              setPagination(
                                (prev: {
                                  currentPage: number;
                                  totalPages: number;
                                }) => ({
                                  ...prev,
                                  currentPage: 1,
                                })
                              );
                            }}
                          >
                            {facility.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Time & Date Filter */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <Clock size={15} /> Available Time
                      </h3>
                      <TimeFilterCard onFilterApply={handleTimeFilter} />
                    </div>

                    {/* Location Filter */}
                    <div className="space-y-4">
                      <h3 className="font-medium flex items-center gap-2">
                        <MapPin size={15} /> Location
                      </h3>

                      <div className="space-y-3">
                        {/* Use My Location Button */}
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full flex items-center justify-center gap-2"
                          onClick={handleGeoLocation}
                        >
                          <MapPin size={14} /> Use My Location
                        </Button>

                        {/* Location Search Input */}
                        <div className="relative">
                          <Input
                            type="text"
                            placeholder="Search location..."
                            className="w-full pr-10"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />

                          {locationLoading && (
                            <div className="absolute inset-y-0 right-3 flex items-center">
                              <svg
                                className="w-4 h-4 text-slate-500 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 11-8 8z"
                                ></path>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Suggestions List */}
                        {suggestions.length > 0 && (
                          <div className="border rounded bg-white shadow-md max-h-48 overflow-y-auto divide-y text-sm">
                            {suggestions.map((place) => (
                              <div
                                key={place.id}
                                className="p-3 cursor-pointer hover:bg-slate-100 transition rounded-sm"
                                onClick={() => handleLocationSelect(place)}
                              >
                                {place.address}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Radius Input */}
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Radius (km)"
                            className="w-full"
                            value={filters.radius}
                            onChange={(e) =>
                              setFilters({ ...filters, radius: e.target.value })
                            }
                          />
                          <span className="text-sm text-slate-500">km</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
