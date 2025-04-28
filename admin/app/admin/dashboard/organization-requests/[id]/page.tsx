'use client';

import {
  CancelProcessOrganizationRequest,
  getSingleOrganizationRequest,
  processOrganizationRequest,
  rejectOrganizationRequest,
} from '@/services/organizationService';

import { ActionButton } from '@/component/buttons/ActionButton';
import { OrganizationRequest } from '@/types/organization';
import { format } from 'date-fns';
import {
  Activity,
  Building,
  Calendar,
  Check,
  Clock,
  Mail,
  Map,
  MapPin,
  Package,
  Phone,
  User,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export default function OrganizationRequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [request, setRequest] = useState<OrganizationRequest | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNotes, setRejectionNotes] = useState<string>('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getSingleOrganizationRequest(
          params.id as string,
        );

        setRequest(response);

        if (response.images && response.images.length > 0) {
          setSelectedImage(response.images[0]);
        }
      } catch (err) {
        setError('Failed to load organization request details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchRequestDetails();
    }
  }, [params.id]);

  const handleProcessRequest = async () => {
    try {
      setProcessing(true);
      setError(null);

      // Call the process API
      const response = await processOrganizationRequest(params.id as string);

      // Update the local state with the new request data
      setRequest(response);

      // Show success message
      toast.success('Request processing started successfully');

      // Route to organization forms page
      router.push(`/admin/dashboard/organization-form/${params.id}`);
    } catch (err: any) {
      console.error('Failed to process request:', err);
      setError(err.message ?? 'Failed to process request');
      toast.error(err.message ?? 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  // Add new handlers
  const handleCancelProcessing = async () => {
    try {
      setIsCancelling(true);
      setError(null);

      const response = await CancelProcessOrganizationRequest(
        params.id as string,
      );
      setRequest(response);
      toast.success('Processing cancelled successfully');
    } catch (err: any) {
      console.error('Failed to cancel processing:', err);
      setError(err.message ?? 'Failed to cancel processing');
      toast.error(err.message ?? 'Failed to cancel processing');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionNotes.trim()) {
      toast.error('Please provide rejection notes');
      return;
    }

    try {
      setIsRejecting(true);
      setError(null);

      const response = await rejectOrganizationRequest(
        params.id as string,
        rejectionNotes.trim(),
      );
      setRequest(response);
      toast.success('Request rejected successfully');
      setRejectionNotes(''); // Reset notes after successful rejection
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      setError(err.message ?? 'Failed to reject request');
      toast.error(err.message ?? 'Failed to reject request');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Error Loading Request
          </h2>
          <p className="text-red-600 mb-4">{error ?? 'Request not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      approved_with_changes: 'bg-purple-50 text-purple-700 border-purple-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    const statusLabels: Record<string, string> = {
      pending: 'Pending',
      processing: 'Processing',
      approved: 'Approved',
      approved_with_changes: 'Approved with Changes',
      rejected: 'Rejected',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
          statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
        }`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatFacilityName = (facility: string) => {
    return facility
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRequestStatusText = (status: string) => {
    if (status === 'approved') return 'Approved';
    if (status === 'approved_with_changes') return 'Approved with Changes';
    return 'Rejected';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            ← Back to Organization Requests
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            {request.organizationName}
            <span className="ml-3">{getStatusBadge(request.status)}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Request ID: {request._id}
          </p>
        </div>

        <div className="flex space-x-4">
          {request.status === 'pending' && (
            <ActionButton
              onClick={handleProcessRequest}
              disabled={processing}
              loading={processing}
              variant="primary"
            >
              Process Request
            </ActionButton>
          )}

          {request.status === 'processing' && (
            <ActionButton
              onClick={handleCancelProcessing}
              disabled={isCancelling}
              loading={isCancelling}
              variant="warning"
            >
              Cancel Processing
            </ActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">
                Request Details
              </h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Building className="w-4 h-4 mr-1" />
                    Organization Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.organizationName}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Owner Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.ownerEmail}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Contact Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.contactPhone}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Created At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {format(new Date(request.createdAt), 'PPP p')}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Requester
                  </dt>
                  {/* <dd className="mt-1 text-sm text-gray-900">
                    {request.requesterId.first_name}{' '}
                    {request.requesterId.last_name} ({request.requesterId.email}
                    )
                  </dd> */}
                </div>

                {request.processingAdminId && (
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      Processing Admin
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {/* {request.}{' '}
                      {request.processingAdminId.last_name} (
                      {request.processingAdminId.email}) */}
                    </dd>
                  </div>
                )}

                {request.processingStartedAt && (
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Processing Started
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {format(new Date(request.processingStartedAt), 'PPP p')}
                    </dd>
                  </div>
                )}

                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {request.location.address},{' '}
                    {request.location.area && `${request.location.area}, `}
                    {request.location.sub_area &&
                      `${request.location.sub_area}, `}
                    {request.location.city}{' '}
                    {request.location.post_code &&
                      `- ${request.location.post_code}`}
                  </dd>
                </div>

                <div className="col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <Map className="w-4 h-4 mr-1" />
                    Coordinates
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    Lat: {request.location.coordinates.coordinates[1]}, Long:{' '}
                    {request.location.coordinates.coordinates[0]}
                    {/* Here you could add a small map view */}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Facilities
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {request.facilities.map(facility => (
                  <span
                    key={facility} // Using facility name as the key since it's unique
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {formatFacilityName(facility)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Request Notes */}
          {request.requestNotes && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">
                  Request Notes
                </h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {request.requestNotes}
                </p>
              </div>
            </div>
          )}

          {/* Approved Organization Info */}
          {request.organizationId && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
                <h2 className="text-lg font-medium text-green-900 flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  Approved Organization Details
                </h2>
              </div>
              <div className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Organization Name
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {request.orgContactEmail}
                    </dd>
                  </div>

                  <div className="col-span-1">
                    <dt className="text-sm font-medium text-gray-500">
                      Organization ID
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {request.organizationId._id}
                    </dd>
                  </div>

                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      Facilities
                    </dt>
                    <dd className="mt-1">
                      <div className="flex flex-wrap gap-2">
                        {request.organizationId.facilities.map(facility => (
                          <span
                            key={facility} // Using facility name as the key since it's unique
                            className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {formatFacilityName(facility)}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>

                  <div className="col-span-2">
                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Address
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {request.organizationId.location.address},
                      {request.organizationId.location.area &&
                        ` ${request.organizationId.location.area},`}
                      {request.organizationId.location.sub_area &&
                        ` ${request.organizationId.location.sub_area},`}
                      {request.organizationId.location.city}
                      {request.organizationId.location.post_code &&
                        ` - ${request.organizationId.location.post_code}`}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>

        {/* Right column - Images */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">
                Organization Images
              </h2>
            </div>
            <div className="p-6">
              {request.images && request.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Selected image preview */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
                    <Image
                      src={selectedImage ?? request.images[0]}
                      alt={`${request.organizationName} image`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>

                  {/* Thumbnails */}
                  {request.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {request.images.map(image => (
                        <button
                          key={image}
                          type="button"
                          className={`relative aspect-square w-full overflow-hidden rounded-md border-2 cursor-pointer ${
                            selectedImage === image
                              ? 'border-blue-500'
                              : 'border-gray-200'
                          }`}
                          onClick={() => setSelectedImage(image)}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedImage(image);
                            }
                          }}
                          aria-label={`Select ${request.organizationName} thumbnail image`}
                        >
                          <Image
                            src={image}
                            alt={`${request.organizationName} thumbnail`}
                            fill
                            sizes="(max-width: 768px) 25vw, 8vw"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm">No images available</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History - Could be expanded */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">
                Status Timeline
              </h2>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                            <Calendar className="h-4 w-4 text-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-gray-500">
                              Request Created
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {format(new Date(request.createdAt), 'PP')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>

                  {request.processingStartedAt && (
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                              <Clock className="h-4 w-4 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-500">
                                Processing Started
                              </p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {format(
                                new Date(request.processingStartedAt),
                                'PP',
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )}

                  {request.status !== 'pending' &&
                    request.status !== 'processing' && (
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div>
                              <span
                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                                  request.status === 'approved' ||
                                  request.status === 'approved_with_changes'
                                    ? 'bg-green-500'
                                    : 'bg-red-500'
                                }`}
                              >
                                {request.status === 'approved' ||
                                request.status === 'approved_with_changes' ? (
                                  <Check className="h-4 w-4 text-white" />
                                ) : (
                                  <X className="h-4 w-4 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Request {getRequestStatusText(request.status)}
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                {format(new Date(request.updatedAt), 'PP')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(request.status === 'pending' || request.status === 'processing') && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h2 className="text-lg font-medium text-red-900 flex items-center">
              <X className="w-5 h-5 mr-2" />
              Reject Request
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label
                htmlFor="rejectionNotes"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Rejection Notes
              </label>
              <textarea
                id="rejectionNotes"
                rows={3}
                className="shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border border-gray-300 rounded-md"
                placeholder="Please provide a reason for rejection..."
                value={rejectionNotes}
                onChange={e => setRejectionNotes(e.target.value)}
              />
            </div>
            <ActionButton
              onClick={handleReject}
              disabled={isRejecting || !rejectionNotes.trim()}
              loading={isRejecting}
              variant="danger"
            >
              Reject Request
            </ActionButton>
          </div>
        </div>
      )}
    </div>
  );
}
