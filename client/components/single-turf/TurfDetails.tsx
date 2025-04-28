"use client";

import { useEffect, useState } from "react";
import { ITurf } from "@/types/turf";
import { ITurfStatusResponse } from "@/types/turf-status-response";
import { getTurfStatus } from "@/lib/server-apis/single-turf/getTurfStatus-api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Volleyball, Users, Clock,
  Building2, CheckCircle,ExternalLink 
} from "lucide-react";
import { motion } from "framer-motion";
import { generateBarikoiMapLink } from "@/lib/server-apis/barikoi/generateMap-api";

interface TurfDetailsProps {
  turf: ITurf;
}

export default function TurfDetails({ turf }: TurfDetailsProps) {
  const [status, setStatus] = useState<ITurfStatusResponse | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const turfStatus = await getTurfStatus(turf._id);
      setStatus(turfStatus);
    };
    fetchStatus();

    // Refresh status every 5 minutes
    const interval = setInterval(fetchStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [turf._id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <Card className="overflow-hidden border-slate-200 hover:border-green-600 transition-all shadow-sm hover:shadow-xl hover:shadow-green-100">
        <CardContent className="p-8 space-y-8">
          {/* Turf Name and Status */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl text-slate-800">{turf.name}</h2>
              <span className="flex items-center text-slate-700 text-lg">
                <Building2 className="h-5 w-5 mr-2" />
                <a 
                  href={`/organization/${turf.organization._id}`} 
                  className="hover:text-green-600 transition-colors"
                >
                  {turf.organization.name}
                </a>
              </span>
            </div>

            {/* Status Badge */}
            {status && (
              <Badge
                variant={status.isOpen ? "default" : "secondary"}
                className={`${
                  status.isOpen
                    ? "bg-green-100 text-green-600 border-green-200"
                    : "bg-red-100 text-red-700 border-red-200"
                } px-3 py-1.5 text-sm font-medium flex items-center gap-2`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status.isOpen ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                />
                {status.status}
              </Badge>
            )}
          </div>

          {/* Address and Map Link */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-slate-600 text-base">
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>{turf.organization?.location?.address || "Address Unavailable"}</span>
            </div>
            {turf.organization?.location?.coordinates ? (
              <a
                href={generateBarikoiMapLink(
                  turf.organization.location.coordinates[0],
                  turf.organization.location.coordinates[1]
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700 ml-8 transition-colors"
              >
                View on map
                <ExternalLink size='15px'/>
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                </svg>
              </a>
            ) : null}
          </div>

          {/* Base Price, Sports, and Team Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-lg text-slate-700">
            <div className="flex items-center">
              <span className="mr-2 text-2xl font-extrabold text-green-600">৳</span>
              <span>Base Price:</span>
              <span className="ml-2 text-green-600 font-bold">
                {turf.basePrice.toFixed(2)}
                <span className="text-base text-slate-500 font-normal"> /hour</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Volleyball className="h-6 w-6 flex-shrink-0" />
              <span>Sports:</span>
              <div className="flex flex-wrap gap-2 ml-2">
                {turf.sports.map((sport) => (
                  <Badge
                    key={sport}
                    variant="secondary"
                    className="bg-green-50 text-green-600 text-sm px-2 py-1 rounded-md"
                  >
                    {sport}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-6 w-6 mr-2" />
              <span>Team Size:</span>
              <span className="ml-2 font-semibold">
                {turf.team_size}v{turf.team_size}
              </span>
            </div>
          </div>

          {/* Operating Hours */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="mb-4 flex items-center text-slate-800 text-xl">
              <Clock className="h-5 w-5 mr-2" /> Operating Hours
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-base text-slate-700">
              {turf.operatingHours.map((hour, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="font-semibold w-24">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][hour.day]}:
                  </span>
                  <span className="font-mono tracking-wide">
                    {hour.open} - {hour.close}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="pt-6 border-t border-slate-200">
            <h3 className="mb-4 flex items-center text-slate-800 text-xl">
              <CheckCircle className="h-5 w-5 mr-2" /> Facilities
            </h3>
            {turf.organization?.facilities && turf.organization.facilities.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {turf.organization.facilities.map((facility) => (
                  <Badge
                    key={facility}
                    variant="outline"
                    className="border-green-300 text-slate-700 text-sm hover:bg-green-50 px-3 py-1 rounded-full transition"
                  >
                    {facility}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-base text-slate-500">No facilities listed.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
