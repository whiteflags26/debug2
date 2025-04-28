'use client';

import ErrorDisplay from '@/component/errors/ErrorDisplay';
import {
  createFacility,
  deleteFacility,
  getAllFacilities,
  updateFacility,
} from '@/services/organizationService';
import { Dialog, Transition } from '@headlessui/react';
import {
  Building2,
  Check,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Types
interface Facility {
  _id: string;
  name: string;
}

interface EditingFacility {
  id: string;
  name: string;
}

export default function FacilitiesPage() {
  // State
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>([]);
  const [newFacility, setNewFacility] = useState('');
  const [editingFacility, setEditingFacility] =
    useState<EditingFacility | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<{ code?: number; message: string } | null>(
    null,
  );

  // Fetch facilities on mount
  useEffect(() => {
    fetchFacilities();
  }, []);

  // Filter facilities when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFacilities(facilities);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredFacilities(
        facilities.filter(facility =>
          facility.name.toLowerCase().includes(lowercasedQuery),
        ),
      );
    }
  }, [searchQuery, facilities]);

  // Fetch all facilities
  const fetchFacilities = async () => {
    try {
      const response = await getAllFacilities();
      if (response.success) {
        setFacilities(response.data);
        setFilteredFacilities(response.data);
      }
    } catch (err: any) {
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || err.message;

      setError({ code: statusCode, message: errorMessage });
      if (statusCode === 403) {
        toast.error('You are not authorized to view facilities');
      } else {
        toast.error('Failed to fetch facilities');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create facility
  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacility.trim()) return;

    setIsCreating(true);
    try {
      const response = await createFacility({ name: newFacility.trim() });
      if (response.success) {
        toast.success('Facility created successfully');
        setNewFacility('');
        await fetchFacilities();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create facility');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Update facility
  const handleUpdateFacility = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingFacility?.id || !editingFacility.name.trim()) {
      return;
    }

    setIsUpdating(true);
    try {
      const response = await updateFacility(editingFacility.id, {
        name: editingFacility.name.trim(),
      });

      if (response.success) {
        toast.success('Facility updated successfully');
        setEditingFacility(null);
        await fetchFacilities();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update facility');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete
  const confirmDelete = (facilityId: string) => {
    setFacilityToDelete(facilityId);
    setIsDeleteModalOpen(true);
  };

  // Delete facility
  const handleDeleteFacility = async () => {
    if (!facilityToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteFacility(facilityToDelete);
      if (response.success) {
        toast.success('Facility deleted successfully');
        setIsDeleteModalOpen(false);
        setFacilityToDelete(null);
        await fetchFacilities();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete facility');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (error?.code === 403) {
    return <ErrorDisplay statusCode={403} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">
            Loading facilities...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building2 className="h-7 w-7 text-white" />
              <h1 className="text-2xl font-bold text-white">
                Facilities Management
              </h1>
            </div>
            <span className="text-xs font-medium px-3 py-1 bg-gray-700 text-white rounded-full">
              {facilities.length}{' '}
              {facilities.length === 1 ? 'Facility' : 'Facilities'}
            </span>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search facilities..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm bg-white text-gray-900"
              />
            </div>

            <form
              onSubmit={handleCreateFacility}
              className="flex sm:w-auto gap-2"
            >
              <input
                type="text"
                value={newFacility}
                onChange={e => setNewFacility(e.target.value)}
                placeholder="New facility name"
                className="flex-1 min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white text-gray-900"
                required
              />
              <button
                type="submit"
                disabled={isCreating}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusCircle className="h-4 w-4" />
                )}
                Add Facility
              </button>
            </form>
          </div>
        </div>

        {/* Facilities List */}
        <div className="divide-y divide-gray-200">
          {filteredFacilities.length === 0 ? (
            <div className="py-10 px-6 text-center">
              <div className="flex flex-col items-center">
                <Building2 className="h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No facilities found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Get started by adding a new facility'}
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredFacilities.map(facility => (
                <li
                  key={facility._id}
                  className="px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {editingFacility?.id === facility._id ? (
                    <form
                      onSubmit={handleUpdateFacility}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={editingFacility.name}
                        onChange={e => {
                          if (editingFacility) {
                            setEditingFacility({
                              id: editingFacility.id,
                              name: e.target.value,
                            });
                          }
                        }}
                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900"
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-70"
                      >
                        {isUpdating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFacility(null)}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-600" />
                        </div>
                        <span className="text-gray-900 font-medium">
                          {facility.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingFacility({
                              id: facility._id,
                              name: facility.name,
                            });
                          }}
                          className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                          title="Edit facility"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(facility._id)}
                          className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                          title="Delete facility"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-center"
                  >
                    Delete Facility
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 text-center">
                      Are you sure you want to delete this facility? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-center space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      onClick={handleDeleteFacility}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
