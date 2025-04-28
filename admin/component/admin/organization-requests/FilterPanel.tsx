'use client';
import { Check, ChevronDown, ChevronUp, Filter, Search, X } from 'lucide-react';
import { useState } from 'react';

interface Filters {
  requesterEmail: string;
  ownerEmail: string;
  status: string[];
}

interface FilterPanelProps {
  readonly filters: Filters;
  readonly setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

interface StatusOption {
  value: string;
  label: string;
}

export function FilterPanel({
  filters,
  setFilters,
}: Readonly<FilterPanelProps>) {
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  const clearFilters = (): void => {
    setFilters({
      requesterEmail: '',
      ownerEmail: '',
      status: [],
    });
  };

  const statusOptions: StatusOption[] = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'approved', label: 'Approved' },
    { value: 'approved_with_changes', label: 'Approved with Changes' },
    { value: 'rejected', label: 'Rejected' },
  ];

  const toggleStatus = (status: string): void => {
    if (filters.status.includes(status)) {
      setFilters(f => ({
        ...f,
        status: f.status.filter(s => s !== status),
      }));
    } else {
      setFilters(f => ({
        ...f,
        status: [...f.status, status],
      }));
    }
  };

  const hasActiveFilters =
    filters.requesterEmail || filters.ownerEmail || filters.status.length > 0;

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </button>
          )}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isFilterExpanded ? 'Collapse' : 'Expand'}
            {isFilterExpanded ? (
              <ChevronUp className="h-3 w-3 ml-1" />
            ) : (
              <ChevronDown className="h-3 w-3 ml-1" />
            )}
          </button>
        </div>
      </div>

      {(isFilterExpanded || hasActiveFilters) && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="requesterEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Requester Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="requesterEmail"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Filter by requester email"
                  value={filters.requesterEmail}
                  onChange={e =>
                    setFilters(f => ({ ...f, requesterEmail: e.target.value }))
                  }
                />
                {filters.requesterEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={() =>
                        setFilters(f => ({ ...f, requesterEmail: '' }))
                      }
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="ownerEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Owner Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="ownerEmail"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Filter by owner email"
                  value={filters.ownerEmail}
                  onChange={e =>
                    setFilters(f => ({ ...f, ownerEmail: e.target.value }))
                  }
                />
                {filters.ownerEmail && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={() =>
                        setFilters(f => ({ ...f, ownerEmail: '' }))
                      }
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.status.includes(option.value)
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {filters.status.includes(option.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
