'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { FilterPanel } from '@/component/admin/organization-requests/FilterPanel';
import { RequestContent } from '@/component/admin/organization-requests/RequestContent';
import ErrorDisplay from '@/component/errors/ErrorDisplay';
import {
  getOrganizationRequests,
  RequestFilters,
} from '@/services/organizationService';
import { OrganizationRequestsResponse } from '@/types/organization';

// Type alias to ensure compatibility between RequestFilters and Filters
type FiltersType = RequestFilters;

export default function OrganizationRequestsPage() {
  const [filters, setFilters] = useState<RequestFilters>({
    requesterEmail: '',
    ownerEmail: '',
    status: [],
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const [data, setData] = useState<OrganizationRequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getOrganizationRequests(filters);
      if (!response?.success || !response?.data?.requests) {
        throw new Error('Invalid response format');
      }

      setData(response);
    } catch (err: any) {
      const statusCode = err.response?.status;
      const errorMessage = err.response?.data?.message || err.message;

      if (statusCode === 403) {
        setError('Unauthorized');
        return;
      }

      setError(errorMessage);
      toast.error(errorMessage || 'Failed to load organization requests');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  if (error === 'Unauthorized') {
    return <ErrorDisplay statusCode={403} />;
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => fetchData();
  const goToPage = (page: number) => setFilters(prev => ({ ...prev, page }));
  const changeLimit = (limit: number) =>
    setFilters(prev => ({ ...prev, limit, page: 1 }));

  const totalPages = data?.data
    ? Math.ceil(data.data.total / filters.limit)
    : 0;
  const startItem = data?.data ? (data.data.page - 1) * filters.limit + 1 : 0;
  const endItem = data?.data
    ? Math.min(startItem + filters.limit - 1, data.data.total)
    : 0;

  const getVisiblePageNumbers = (
    currentPage: number,
    totalPages: number,
    maxPages = 5,
  ): number[] => {
    let start = Math.max(1, currentPage - 2);
    if (start + maxPages - 1 > totalPages) {
      start = Math.max(1, totalPages - maxPages + 1);
    }
    return Array.from(
      { length: Math.min(maxPages, totalPages) },
      (_, i) => start + i,
    );
  };

  // Handle the button class logic separately to avoid nested ternaries
  const getPageButtonClass = (isCurrentPage: boolean): string => {
    if (isCurrentPage) {
      return 'bg-blue-100 text-blue-700 border-blue-500';
    }
    return 'text-gray-500 border-gray-300 hover:bg-gray-50';
  };

  // Handle the navigation button class logic separately
  const getNavButtonClass = (isDisabled: boolean): string => {
    if (isDisabled) {
      return 'text-gray-300 cursor-not-allowed';
    }
    return 'text-gray-500 hover:bg-gray-100';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Organization Requests
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and review all organization registration requests
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Refresh
        </button>
      </header>

      <FilterPanel filters={filters} setFilters={setFilters as any} />

      <RequestContent
        isLoading={isLoading}
        error={error}
        data={data}
        handleRefresh={handleRefresh}
        filters={filters}
        startItem={startItem}
        endItem={endItem}
        totalPages={totalPages}
        changeLimit={changeLimit}
        goToPage={goToPage}
        getNavButtonClass={getNavButtonClass}
        getPageButtonClass={getPageButtonClass}
        getVisiblePageNumbers={getVisiblePageNumbers}
      />
    </div>
  );
}
