"use client";

import { useEffect, useState } from "react";
import { fetchTurfs } from "@/lib/server-apis/turf/fetchTurf-api";
import TurfFilters from "@/components/turfs/TurfFilters";
import TurfGrid from "@/components/turfs/TurfGrid";
import TurfPagination from "@/components/turfs/TurfPagination";
import HeroSection from "@/components/turfs/TurfHeroSection";
import ErrorAlert from "@/components/turfs/TurfErrorAlert";
import { ITurf } from "@/types/turf";
import { IPagination } from "@/types/pagination";
import { ITurfFilters } from "@/types/turfFilter";
import { EmptyTurfFilters } from "@/constants/emptyTurfFilter";


export default function TurfExplorePage() {
  const [turfs, setTurfs] = useState<ITurf[]>([]);
  const [allTurfs, setAllTurfs] = useState<ITurf[]>([]);
  const [pagination, setPagination] = useState<IPagination>({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
    limit: 9,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ITurfFilters>({
    sports: [],
    teamSize: [],
    facilities: [],
    minPrice: "",
    maxPrice: "",
    preferredDate: "",
    preferredTimeStart: "",
    preferredTimeEnd: "",
    latitude: "",
    longitude: "",
    radius: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedTurf, setSelectedTurf] = useState<ITurf | null>(null);

  const loadTurfs = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchTurfs(filters, pagination);
      setTurfs(result.data);
      if (allTurfs.length === 0) {
        const allData = await fetchTurfs(EmptyTurfFilters, {
          currentPage: 1,
          limit: 1000,
          totalPages: 1,
          totalResults: 0,
        }); // fetch unfiltered
        setAllTurfs(allData.data);
      }

      setPagination(result.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load turfs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTurfs();
    }, 800);
    return () => clearTimeout(timer);
  }, [filters, pagination.currentPage]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-gradient-to-b from-white to-slate-50 min-h-screen">
      <HeroSection />
      <ErrorAlert error={error} setError={setError} />
      <TurfFilters
        turfs={allTurfs}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setPagination={setPagination}
      />
      <TurfGrid
        loading={loading}
        turfs={turfs}
        filters={filters}
        pagination={pagination}
        selectedTurf={selectedTurf}
        setSelectedTurf={setSelectedTurf}
        resetFilters={() => {
          setFilters({
            sports: [],
            teamSize: [],
            facilities: [],
            minPrice: "",
            maxPrice: "",
            preferredDate: "",
            preferredTimeStart: "",
            preferredTimeEnd: "",
            latitude: "",
            longitude: "",
            radius: "",
          });
          setActiveTab("all");
        }}
      />
      <TurfPagination pagination={pagination} setPagination={setPagination} />
    </div>
  );
}




