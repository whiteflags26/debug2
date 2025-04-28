'use client';

import {
  createSport,
  deleteSport,
  getAllSports,
  updateSport,
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
interface Sport {
  _id: string;
  name: string;
}

interface EditingSport {
  id: string;
  name: string;
}

export default function SportsPage() {
  // State
  const [sports, setSports] = useState<Sport[]>([]);
  const [filteredSports, setFilteredSports] = useState<Sport[]>([]);
  const [newSport, setNewSport] = useState('');
  const [editingSport, setEditingSport] = useState<EditingSport | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sportToDelete, setSportToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch sports on mount
  useEffect(() => {
    fetchSports();
  }, []);

  // Filter sports when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSports(sports);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredSports(
        sports.filter(sport =>
          sport.name.toLowerCase().includes(lowercasedQuery),
        ),
      );
    }
  }, [searchQuery, sports]);

  // Fetch all sports
  const fetchSports = async () => {
    try {
      const response = await getAllSports();
      if (response.success) {
        setSports(response.data);
        setFilteredSports(response.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch sports');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create sport
  const handleCreateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSport.trim()) return;

    setIsCreating(true);
    try {
      const response = await createSport({ name: newSport.trim() });
      if (response.success) {
        toast.success('Sport created successfully');
        setNewSport('');
        await fetchSports();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create sport');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Update sport
  const handleUpdateSport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSport?.id || !editingSport.name.trim()) return;

    setIsUpdating(true);
    try {
      const response = await updateSport(editingSport.id, {
        name: editingSport.name.trim(),
      });
      if (response.success) {
        toast.success('Sport updated successfully');
        setEditingSport(null);
        await fetchSports();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update sport');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete
  const confirmDelete = (sportId: string) => {
    setSportToDelete(sportId);
    setIsDeleteModalOpen(true);
  };

  // Delete sport
  const handleDeleteSport = async () => {
    if (!sportToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteSport(sportToDelete);
      if (response.success) {
        toast.success('Sport deleted successfully');
        setIsDeleteModalOpen(false);
        setSportToDelete(null);
        await fetchSports();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete sport');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-gray-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">
            Loading sports...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Building2 className="h-7 w-7 text-white" />
            <h1 className="text-2xl font-bold text-white">Sports Management</h1>
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-gray-700 text-white rounded-full">
            {sports.length} {sports.length === 1 ? 'Sport' : 'Sports'}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Search and Create */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sports..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm bg-white text-gray-900"
            />
          </div>

          <form onSubmit={handleCreateSport} className="flex gap-2">
            <input
              type="text"
              value={newSport}
              onChange={e => setNewSport(e.target.value)}
              placeholder="New sport name"
              className="min-w-0 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white text-gray-900"
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
              Add Sport
            </button>
          </form>
        </div>

        {/* Sports List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredSports.map(sport => (
              <li key={sport._id} className="p-4">
                {editingSport?.id === sport._id ? (
                  <form onSubmit={handleUpdateSport} className="flex gap-2">
                    <input
                      type="text"
                      value={editingSport.name}
                      onChange={e =>
                        setEditingSport({
                          ...editingSport,
                          name: e.target.value,
                        })
                      }
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white text-gray-900"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSport(null)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {sport.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setEditingSport({
                            id: sport._id,
                            name: sport.name,
                          })
                        }
                        className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(sport._id)}
                        className="p-2 rounded-full text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
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
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Delete Sport
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this sport? This action
                      cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      onClick={() => setIsDeleteModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      onClick={handleDeleteSport}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
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
