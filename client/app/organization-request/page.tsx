'use client';

import { useAuth } from '@/lib/contexts/authContext';
import {
  createOrganizationRequest,
  getFacilities,
} from '@/lib/server-apis/organization-request/organizationRequestService';
import { handleImageUpload as processImageUpload } from '@/lib/utils/image-upload';
import {
  ArrowLeft,
  Building,
  Check,
  FileText,
  MapPin,
  Package,
  Phone,
  Upload,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function CreateOrganizationRequestForm() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Form state
  const [organizationName, setOrganizationName] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [availableFacilities, setAvailableFacilities] = useState<string[]>([]); // Added state for fetched facilities
  const [address, setAddress] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [postCode, setPostCode] = useState('');
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [contactPhone, setContactPhone] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [orgContactPhone, setOrgContactPhone] = useState('');
  const [orgContactEmail, setOrgContactEmail] = useState('');

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(true); // Added loading state for facilities
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch facilities on component mount
  useEffect(() => {
    async function loadFacilities() {
      try {
        setFacilitiesLoading(true);
        const response = await getFacilities();

        if (response.ok && Array.isArray(response.data)) {
          setAvailableFacilities(response.data);
        } else {
          console.error('Failed to load facilities:', response.data);
          toast.error('Failed to load facilities. Please refresh the page.');
        }
      } catch (error) {
        console.error('Error loading facilities:', error);
        toast.error('An error occurred while loading facilities.');
      } finally {
        setFacilitiesLoading(false);
      }
    }

    loadFacilities();
  }, []);

  // Populate email from user context if available
  useEffect(() => {
    if (user) {
      setOwnerEmail(user.email);
    }
  }, [user]);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please sign in to submit an organization request');
      router.push('/sign-in');
    }
  }, [authLoading, user, router]);

  // Handler functions
  const handleFacilityToggle = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility],
    );
  };

  const formatFacilityName = (facility: string) => {
    return facility
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target?.files?.length) return;

    try {
      const result = processImageUpload(
        e.target.files,
        [], // No existing images
        {
          maxImages: 5,
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
      );

      if (!result.isValid) {
        toast.error(result.errorMessage || 'Invalid image upload');
        return;
      }

      // Validate file sizes
      const validFiles = Array.from(e.target.files).filter(file => {
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidSize) {
          toast.error(`File ${file.name} exceeds 5MB limit`);
        }
        return isValidSize;
      });

      if (validFiles.length === 0) {
        toast.error('No valid files to upload');
        return;
      }

      // Update images state
      setImages(prev => {
        const newImages = [...prev];
        validFiles.forEach(file => {
          if (newImages.length < 5) {
            newImages.push(file);
          }
        });

        return newImages;
      });

      // Clear the input
      e.target.value = '';
    } catch (error) {
      console.error('Error handling image upload:', error);
      toast.error('Failed to process images');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields first
      if (
        !organizationName ||
        !facilities.length ||
        !address ||
        !placeId ||
        !city
      ) {
        toast.error('Please fill in all required organization details');
        setLoading(false);
        return;
      }

      // Validate contact information
      if (
        !contactPhone ||
        !ownerEmail ||
        !orgContactPhone ||
        !orgContactEmail
      ) {
        toast.error('Please provide all contact information');
        setLoading(false);
        return;
      }

      // Create FormData instance
      const formData = new FormData();

      // Add ALL required fields
      formData.append('organizationName', organizationName);
      formData.append('facilities', JSON.stringify(facilities));
      formData.append('contactPhone', contactPhone); // Add this
      formData.append('ownerEmail', ownerEmail); // Add this

      // Add location data
      formData.append(
        'location',
        JSON.stringify({
          place_id: placeId,
          address,
          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          area: area || undefined,
          sub_area: subArea || undefined,
          city,
          post_code: postCode || undefined,
        }),
      );

      // Add contact information
      formData.append('orgContactPhone', orgContactPhone);
      formData.append('orgContactEmail', orgContactEmail);

      // Add optional fields
      if (requestNotes) {
        formData.append('requestNotes', requestNotes);
      }

      // Add image files if any
      if (images.length > 0) {
        // Validate image size and format before submission
        const isValidImages = images.every(file => {
          const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
          const isValidType = [
            'image/jpeg',
            'image/png',
            'image/webp',
          ].includes(file.type);

          if (!isValidSize) {
            toast.error(`Image ${file.name} exceeds 5MB size limit`);
          }
          if (!isValidType) {
            toast.error(
              `Image ${file.name} is not in a valid format (JPG, PNG, WebP)`,
            );
          }

          return isValidSize && isValidType;
        });

        if (!isValidImages) {
          setLoading(false);
          return;
        }

        images.forEach(file => {
          formData.append('images', file);
        });
      }

      // Debug log
      for (const [key, value] of formData.entries()) {
        console.log(`FormData field - ${key}:`, value);
      }

      const response = await createOrganizationRequest(
        {
          organizationName,
          facilities,
          location: {
            place_id: placeId,
            address,
            coordinates: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            area: area || undefined,
            sub_area: subArea || undefined,
            city,
            post_code: postCode || undefined,
          },
          contactPhone,
          ownerEmail,
          orgContactPhone,
          orgContactEmail,
          requestNotes: requestNotes || undefined,
        },
        images.length > 0 ? images : undefined,
      );

      if (!response.ok) {
        throw new Error(
          response.data.message ?? 'Failed to submit organization request',
        );
      }

      setSuccess(true);
      toast.success('Organization request submitted successfully!');

      // Reset form after successful submission
      setTimeout(() => {
        router.push('/organizations');
      }, 2000);
    } catch (error) {
      console.error('Error submitting organization request:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to submit request',
      );
      toast.error(
        error instanceof Error ? error.message : 'Failed to submit request',
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    organizationName &&
    facilities.length > 0 &&
    address &&
    placeId &&
    city &&
    longitude !== 0 &&
    latitude !== 0 &&
    contactPhone &&
    ownerEmail &&
    orgContactPhone &&
    orgContactEmail;

  // Handle back navigation
  const goBack = () => {
    router.back();
  };

  // Loading state while checking auth
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mb-4"
            xmlns="http://www.w3.org/2000/svg"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Input field styling
  const inputClasses =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={goBack}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Submit Organization Request
        </h1>
        <p className="text-gray-600 mt-1">
          Fill out the form below to request a new organization to be added to
          our platform.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">
            Organization request submitted successfully! Redirecting...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <X className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Basic Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Basic Information
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="organizationName"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Organization Name*
                    </label>
                    <input
                      type="text"
                      id="organizationName"
                      value={organizationName}
                      onChange={e => setOrganizationName(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contactPhone"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Contact Phone*
                    </label>
                    <input
                      type="tel"
                      id="contactPhone"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter contact phone number"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ownerEmail"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Owner Email*
                    </label>
                    <input
                      type="email"
                      id="ownerEmail"
                      value={ownerEmail}
                      onChange={e => setOwnerEmail(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter owner email"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orgContactPhone"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Organization Contact Phone*
                    </label>
                    <input
                      type="tel"
                      id="orgContactPhone"
                      value={orgContactPhone}
                      onChange={e => setOrgContactPhone(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="+8801XXXXXXXXX"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orgContactEmail"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Organization Contact Email*
                    </label>
                    <input
                      type="email"
                      id="orgContactEmail"
                      value={orgContactEmail}
                      onChange={e => setOrgContactEmail(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="organization@example.com"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Location Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Full Address*
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter full address"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="place_id"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Place ID*
                    </label>
                    <input
                      type="text"
                      id="place_id"
                      value={placeId}
                      onChange={e => setPlaceId(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter place ID"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-900"
                    >
                      City*
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="area"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Area
                    </label>
                    <input
                      type="text"
                      id="area"
                      value={area}
                      onChange={e => setArea(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter area (optional)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="sub_area"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Sub Area
                    </label>
                    <input
                      type="text"
                      id="sub_area"
                      value={subArea}
                      onChange={e => setSubArea(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter sub area (optional)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="post_code"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Post Code
                    </label>
                    <input
                      type="text"
                      id="post_code"
                      value={postCode}
                      onChange={e => setPostCode(e.target.value)}
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="Enter post code (optional)"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="longitude"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Longitude*
                    </label>
                    <input
                      type="number"
                      id="longitude"
                      value={longitude || ''}
                      onChange={e =>
                        setLongitude(parseFloat(e.target.value) || 0)
                      }
                      step="0.000001"
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="0.000000"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="latitude"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Latitude*
                    </label>
                    <input
                      type="number"
                      id="latitude"
                      value={latitude || ''}
                      onChange={e =>
                        setLatitude(parseFloat(e.target.value) || 0)
                      }
                      step="0.000001"
                      className={`${inputClasses} placeholder-gray-500`}
                      placeholder="0.000000"
                      required
                    />
                  </div>
                </div>
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
                {facilitiesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <svg
                      className="animate-spin h-6 w-6 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="ml-2 text-gray-600">
                      Loading facilities...
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableFacilities.length > 0 ? (
                      availableFacilities.map(facility => (
                        <button
                          key={facility}
                          type="button"
                          onClick={() => handleFacilityToggle(facility)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            facilities.includes(facility)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          {formatFacilityName(facility)}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500">No facilities available</p>
                    )}
                  </div>
                )}
                {!facilitiesLoading &&
                  facilities.length === 0 &&
                  availableFacilities.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      Please select at least one facility
                    </p>
                  )}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Additional Notes
                </h2>
              </div>
              <div className="p-6">
                <div>
                  <label
                    htmlFor="requestNotes"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Request Notes (Optional)
                  </label>
                  <textarea
                    id="requestNotes"
                    value={requestNotes}
                    onChange={e => setRequestNotes(e.target.value)}
                    rows={4}
                    className={`${inputClasses} placeholder-gray-500`}
                    placeholder="Add any additional information about your organization request"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Organization Images
                  <span className="ml-2 text-sm text-gray-500">
                    ({images.length}/5 images)
                  </span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* New Image Upload */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Add Images
                    </h3>
                    <label
                      htmlFor="imageUpload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                        images.length >= 5
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-900">
                          <span className="font-semibold">Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG or WEBP (Max size: 5MB)
                        </p>
                      </div>
                      <input
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={images.length >= 5}
                      />
                    </label>
                  </div>

                  {/* Images Preview */}
                  {images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        Images to Upload
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {images.map((file, idx) => (
                          <div key={`new-${idx}`} className="relative group">
                            <div className="aspect-square w-full overflow-hidden rounded-md">
                              <Image
                                src={URL.createObjectURL(file)}
                                alt={`Organization image ${idx + 1}`}
                                className="object-cover w-full h-full"
                                fill
                                sizes="(max-width: 768px) 50vw, 33vw"
                                priority={idx === 0}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeImage(idx)}
                                  className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-600"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submission Guidelines */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">
                Submission Guidelines
              </h3>
              <ul className="text-sm text-blue-700 space-y-1 list-disc pl-5">
                <li>
                  All organization requests are reviewed by our admin team
                </li>
                <li>Approval process typically takes 2-3 business days</li>
                <li>You will be notified via email about the status</li>
                <li>Make sure all required fields are filled correctly</li>
                <li>Upload clear images of your organization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Form actions */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isFormValid || facilitiesLoading}
            className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading || !isFormValid || facilitiesLoading
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit Request'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

