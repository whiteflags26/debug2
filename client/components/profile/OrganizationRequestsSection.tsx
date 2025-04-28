"use client";

import { useEffect, useState } from "react";
import { getUserOrganizationRequests } from "@/lib/server-apis/profile/getUserOrganizationRequests-api";
import { IOrganizationRequest } from "@/types/organizationRequest";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  BsCheckCircleFill,
  BsXCircleFill,
  BsClock,
  BsBuilding,
  BsArrowRight,
  BsTelephone,
  BsEnvelope,
  BsGeoAlt,
  BsImage,
} from "react-icons/bs";
import Image from "next/image";
import Link from "next/link";

export default function OrganizationRequestsSection() {
  const [requests, setRequests] = useState<IOrganizationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const data = await getUserOrganizationRequests();
        setRequests(data);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error("Failed to load organization requests");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "approved_with_changes":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      case "processing":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "approved_with_changes":
        return <BsCheckCircleFill className="text-green-600" />;
      case "rejected":
        return <BsXCircleFill className="text-red-600" />;
      case "processing":
        return <BsClock className="text-blue-600" />;
      default:
        return <BsClock className="text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm p-6 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded"></div>
                  <div className="h-3 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <BsBuilding className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          Failed to load requests
        </h3>
        <p className="mt-1 text-gray-500">{error}</p>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <BsBuilding className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-900">
          No organization requests
        </h3>
        <p className="mt-1 text-gray-500 mb-6">
          You haven&#39;t submitted any organization requests yet.
        </p>
        <Link
          href="/organizations/new"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/90"
        >
          Create an organization request
          <BsArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div
          key={request._id}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="relative flex-shrink-0 w-16 h-16">
                <div className="absolute inset-0 bg-gray-100 rounded-lg" />
                <BsBuilding className="absolute inset-0 m-auto h-8 w-8 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {request.organizationName}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(request.createdAt), "MMM dd, yyyy")}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {request.facilities.slice(0, 3).map((facility, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {facility}
                    </span>
                  ))}
                  {request.facilities.length > 3 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{request.facilities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start md:self-center">
              {getStatusIcon(request.status)}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {/* Location Information */}
            <div className="flex items-start gap-2">
              <BsGeoAlt className="mt-1 text-gray-500" />
              <div>
                <h4 className="text-sm font-medium text-gray-700">Location</h4>
                <p className="text-sm text-gray-600">
                  {request.location.address}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <BsTelephone className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Requestor: {request.contactPhone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BsTelephone className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Organization: {request.orgContactPhone}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BsEnvelope className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Owner: {request.ownerEmail}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BsEnvelope className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  Organization: {request.orgContactEmail}
                </span>
              </div>
            </div>

            {/* Images */}
            {request.images.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <BsImage className="text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Images</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {request.images.map((image, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`Organization image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Processing Started Date */}
            {request.status === "processing" && request.processingStartedAt && (
              <div className="text-sm text-gray-500">
                Processing started on:{" "}
                {format(new Date(request.processingStartedAt), "MMM dd, yyyy")}
              </div>
            )}
          </div>

          {(request.requestNotes || request.adminNotes) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              {request.requestNotes && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    Request Notes:
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {request.requestNotes}
                  </p>
                </div>
              )}
              {request.adminNotes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700">
                    Admin Response:
                  </h4>
                  <p className="text-gray-600 text-sm mt-1">
                    {request.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}

          {request.status === "approved" && request.organizationId && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link
                href={`/organizations/${request.organizationId}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/90 text-sm font-medium"
              >
                View Organization
                <BsArrowRight />
              </Link>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
