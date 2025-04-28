"use client";

import { ITurf } from "@/types/turf";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

interface OtherOrganizationTurfsProps {
  turfs: ITurf[];
  currentTurfId: string;
}

export default function OtherOrganizationTurfs({
  turfs,
  currentTurfId,
}: OtherOrganizationTurfsProps) {
  const filteredTurfs = turfs.filter((turf) => turf._id !== currentTurfId);
  const [showAll, setShowAll] = useState(false);

  if (filteredTurfs.length === 0) return null;

  const turfsToShow = showAll ? filteredTurfs : filteredTurfs.slice(0, 3);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-6 w-6" />
        <h2 className="text-xl text-slate-800">
          Other Turfs by this Organization
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="wait">
          {turfsToShow.map((turf, index) => (
            <motion.div
              key={turf._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="group overflow-hidden border-slate-200 hover:border-green-600 transition-all hover:shadow-lg">
                <Link href={`/venues/${turf._id}`} className="flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-1/3 h-48 sm:h-auto">
                    <Image
                      src={turf.images[0] || "/placeholder.svg"}
                      alt={turf.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="h-full flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-slate-800">
                          {turf.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {turf.organization?.location?.address || "Address Unavailable"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                         <span className="text-2xl text-green-600">৳</span>
                          <span className="font-medium text-green-600">
                            {turf.basePrice.toFixed(2)}
                          </span>
                          <span className="text-slate-500">/hour</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {turf.sports.slice(0, 3).map((sport) => (
                          <Badge
                            key={sport}
                            variant="secondary"
                            className="bg-green-50 text-green-600 hover:bg-green-100 text-xs"
                          >
                            {sport}
                          </Badge>
                        ))}
                        {turf.sports.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-green-50 text-green-700 hover:bg-green-100 text-xs"
                          >
                            +{turf.sports.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTurfs.length > 3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center mt-4"
        >
          <Button
            onClick={() => setShowAll((prev) => !prev)}
            variant="outline"
            className="w-full"
          >
            {showAll ? "Show Less" : `Show ${filteredTurfs.length - 3} More`}
          </Button>
        </motion.div>
      )}
    </motion.section>
  );
}
