'use client';

import {
  createTeamSize,
  deleteTeamSize,
  getAllTeamSizes,
  updateTeamSize,
} from '@/services/organizationService';
import { Dialog, Transition } from '@headlessui/react';
import {
  Check,
  Loader2,
  Pencil,
  PlusCircle,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Types
interface TeamSize {
  _id: string;
  name: string;
}

interface EditingTeamSize {
  id: string;
  name: string;
}

export default function TeamSizesPage() {
  // State
  const [teamSizes, setTeamSizes] = useState<TeamSize[]>([]);
  const [filteredTeamSizes, setFilteredTeamSizes] = useState<TeamSize[]>([]);
  const [newTeamSize, setNewTeamSize] = useState('');
  const [editingTeamSize, setEditingTeamSize] =
    useState<EditingTeamSize | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teamSizeToDelete, setTeamSizeToDelete] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch team sizes on mount
  useEffect(() => {
    fetchTeamSizes();
  }, []);

  // Filter team sizes when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTeamSizes(teamSizes);
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      setFilteredTeamSizes(
        teamSizes.filter(teamSize =>
          teamSize.name.toLowerCase().includes(lowercasedQuery),
        ),
      );
    }
  }, [searchQuery, teamSizes]);

  // Fetch all team sizes
  const fetchTeamSizes = async () => {
    try {
      const response = await getAllTeamSizes();
      if (response.success) {
        setTeamSizes(response.data);
        setFilteredTeamSizes(response.data);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to fetch team sizes');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create team size
  const handleCreateTeamSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamSize.trim()) return;

    setIsCreating(true);
    try {
      const response = await createTeamSize({ name: newTeamSize.trim() });
      if (response.success) {
        toast.success('Team size created successfully');
        setNewTeamSize('');
        await fetchTeamSizes();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to create team size');
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Update team size
  const handleUpdateTeamSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeamSize?.id || !editingTeamSize.name.trim()) return;

    setIsUpdating(true);
    try {
      const response = await updateTeamSize(editingTeamSize.id, {
        name: editingTeamSize.name.trim(),
      });
      if (response.success) {
        toast.success('Team size updated successfully');
        setEditingTeamSize(null);
        await fetchTeamSizes();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to update team size');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete
  const confirmDelete = (teamSizeId: string) => {
    setTeamSizeToDelete(teamSizeId);
    setIsDeleteModalOpen(true);
  };

  // Delete team size
  const handleDeleteTeamSize = async () => {
    if (!teamSizeToDelete) return;

    setIsDeleting(true);
    try {
      const response = await deleteTeamSize(teamSizeToDelete);
      if (response.success) {
        toast.success('Team size deleted successfully');
        setIsDeleteModalOpen(false);
        setTeamSizeToDelete(null);
        await fetchTeamSizes();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to delete team size');
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
            Loading team sizes...
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
            <Users className="h-7 w-7 text-white" />
            <h1 className="text-2xl font-bold text-white">
              Team Sizes Management
            </h1>
          </div>
          <span className="text-xs font-medium px-3 py-1 bg-gray-700 text-white rounded-full">
            {teamSizes.length} {teamSizes.length === 1 ? 'Size' : 'Sizes'}
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
              placeholder="Search team sizes..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm bg-white text-gray-900"
            />
          </div>

          <form onSubmit={handleCreateTeamSize} className="flex gap-2">
            <input
              type="text"
              value={newTeamSize}
              onChange={e => setNewTeamSize(e.target.value)}
              placeholder="New team size"
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
              Add Size
            </button>
          </form>
        </div>

        {/* Team Sizes List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredTeamSizes.map(teamSize => (
              <li key={teamSize._id} className="p-4">
                {editingTeamSize?.id === teamSize._id ? (
                  <form onSubmit={handleUpdateTeamSize} className="flex gap-2">
                    <input
                      type="text"
                      value={editingTeamSize.name}
                      onChange={e =>
                        setEditingTeamSize({
                          ...editingTeamSize,
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
                      onClick={() => setEditingTeamSize(null)}
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
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {teamSize.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setEditingTeamSize({
                            id: teamSize._id,
                            name: teamSize.name,
                          })
                        }
                        className="p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => confirmDelete(teamSize._id)}
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
                    Delete Team Size
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this team size? This
                      action cannot be undone.
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
                      onClick={handleDeleteTeamSize}
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
