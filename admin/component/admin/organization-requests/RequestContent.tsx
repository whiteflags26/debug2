import { OrganizationRequestsResponse } from '@/types/organization';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { RequestsTable } from './RequestTable';
import { RequestFilters } from '@/services/organizationService';

interface RequestContentProps {
  isLoading: boolean;
  error: string | null;
  data: OrganizationRequestsResponse | null;
  handleRefresh: () => void;
  filters: RequestFilters;
  startItem: number;
  endItem: number;
  totalPages: number;
  changeLimit: (limit: number) => void;
  goToPage: (page: number) => void;
  getNavButtonClass: (isDisabled: boolean) => string;
  getPageButtonClass: (isCurrentPage: boolean) => string;
  getVisiblePageNumbers: (currentPage: number, totalPages: number) => number[];
}

export function RequestContent({
  isLoading,
  error,
  data,
  handleRefresh,
  filters,
  startItem,
  endItem,
  totalPages,
  changeLimit,
  goToPage,
  getNavButtonClass,
  getPageButtonClass,
  getVisiblePageNumbers,
}: RequestContentProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
        <p>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-2 text-sm font-medium text-red-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!data?.data?.requests?.length) {
    return (
      <div className="text-center py-12 text-gray-500">
        No organization requests found
      </div>
    );
  }

  return (
    <>
      <RequestsTable data={data.data.requests} />
      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center bg-white px-4 py-3 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-sm text-gray-700 mb-4 sm:mb-0">
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{data.data.total}</span> results
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filters.limit}
            onChange={e => changeLimit(Number(e.target.value))}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            {[5, 10, 25, 50].map(size => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>

          <nav
            className="inline-flex rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => goToPage(filters.page - 1)}
              disabled={filters.page === 1}
              className={`px-2 py-2 border rounded-l-md ${getNavButtonClass(
                filters.page === 1,
              )}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getVisiblePageNumbers(filters.page, totalPages).map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-4 py-2 border text-sm font-medium ${getPageButtonClass(
                  filters.page === page,
                )}`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(filters.page + 1)}
              disabled={filters.page === totalPages}
              className={`px-2 py-2 border rounded-r-md ${getNavButtonClass(
                filters.page === totalPages,
              )}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
