'use client';

import ErrorDisplay from '@/component/errors/ErrorDisplay';
import {
  createOrganization,
  getAllFacilities,
} from '@/services/organizationService'; // Import the backend service
import {
  prepareImagesForSubmission,
  handleImageUpload as processImageUpload,
} from '@/utils/image-upload';
import { Building, Check, MapPin, Package, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function OrganizationForm() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [subArea, setSubArea] = useState('');
  const [postCode, setPostCode] = useState('');
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);
  const [facilities, setFacilities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orgContactPhone, setOrgContactPhone] = useState('');
  const [orgContactEmail, setOrgContactEmail] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [facilityOptions, setFacilityOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await getAllFacilities();
        if (response.success) {
          setFacilityOptions(
            response.data.map((facility: any) => facility.name),
          );
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setError('Failed to load facilities');
      }
    };

    fetchFacilities();
  }, []);

  const handleFacilityToggle = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility],
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const result = processImageUpload(
      Array.from(e.target.files), // Convert FileList to array
      [], // No existing images
      {
        maxImages: 5,
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
      },
    );

    if (!result || !result.isValid) {
      setError(result?.errorMessage || 'Image upload failed');
      return;
    }

    setImageFiles(prev => [...prev, ...result.files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set('name', name);
      formData.set('facilities', JSON.stringify(facilities));
      formData.set(
        'location',
        JSON.stringify({
          place_id: placeId,
          address,
          city,
          area,
          sub_area: subArea,
          post_code: postCode,
          coordinates: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        }),
      );
      formData.set('orgContactPhone', orgContactPhone);
      formData.set('orgContactEmail', orgContactEmail);
      formData.set('adminNotes', adminNotes);
      formData.set('wasEdited', 'False');

      // Use the utility function to prepare images
      const preparedFormData = prepareImagesForSubmission(formData, imageFiles);

      // Call the backend service
      const response = await createOrganization(preparedFormData);
      console.log('Organization created:', response);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || err.message;

      if (statusCode === 403) {
        return <ErrorDisplay statusCode={403} />;
      }

      setError(errorMessage);
      toast.error(errorMessage || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    name &&
    address &&
    placeId &&
    city &&
    facilities.length > 0 &&
    orgContactPhone &&
    orgContactEmail;

  // Add error check at the top of your render
  if (error === 'Unauthorized' || error === 'Forbidden') {
    return <ErrorDisplay statusCode={403} />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <button className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Organization
        </h1>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center">
          <Check className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">Organization created successfully!</p>
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
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center">
                <Building className="w-5 h-5 mr-2 text-gray-700" />
                <h2 className="text-lg font-medium text-gray-800">
                  Basic Information
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Organization Name*
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="orgContactPhone"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Contact Phone*
                    </label>
                    <input
                      id="orgContactPhone"
                      value={orgContactPhone}
                      onChange={e => setOrgContactPhone(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+8801XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="orgContactEmail"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Contact Email*
                    </label>
                    <input
                      id="orgContactEmail"
                      type="email"
                      value={orgContactEmail}
                      onChange={e => setOrgContactEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="organization@example.com"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="adminNotes"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Admin Notes
                    </label>
                    <textarea
                      id="adminNotes"
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Add any administrative notes here..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-700" />
                <h2 className="text-lg font-medium text-gray-800">
                  Location Details
                </h2>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Full Address*
                  </label>
                  <input
                    id="address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full address"
                  />
                </div>

                <div>
                  <label
                    htmlFor="placeId"
                    className="block text-sm font-medium text-gray-900"
                  >
                    Place ID*
                  </label>
                  <input
                    id="placeId"
                    value={placeId}
                    onChange={e => setPlaceId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter place ID"
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
                    id="city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter city"
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
                    id="longitude"
                    type="number"
                    value={longitude}
                    onChange={e => setLongitude(parseFloat(e.target.value))}
                    step="0.000001"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.000000"
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
                    id="latitude"
                    type="number"
                    value={latitude}
                    onChange={e => setLatitude(parseFloat(e.target.value))}
                    step="0.000001"
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.000000"
                  />
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-700" />
                <h2 className="text-lg font-medium text-gray-800">
                  Facilities
                </h2>
              </div>
              <div className="p-6 flex flex-wrap gap-2">
                {facilityOptions.length > 0 ? (
                  facilityOptions.map(facility => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => handleFacilityToggle(facility)}
                      className={`px-4 py-2 rounded-full text-sm font-medium ${
                        facilities.includes(facility)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {facility}{' '}
                      {/* Display facility name exactly as received */}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">Loading facilities...</p>
                )}
              </div>
            </div>
          </div>

          {/* Right column - Images */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-medium text-gray-800">
                  Organization Images
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <label
                  htmlFor="imageUpload"
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
                    imageFiles.length >= 5
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <div className="flex flex-col items-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, or WEBP (Max: 5 images)
                    </p>
                  </div>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={imageFiles.length >= 5}
                  />
                </label>

                {imageFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-32 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-red-100"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              isFormValid
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
}
