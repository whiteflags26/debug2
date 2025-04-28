import { OrganizationRequest } from '@/types/organization';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { JSX, useState } from 'react';

type SortKey = keyof OrganizationRequest;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

interface RequestsTableProps {
  readonly data: OrganizationRequest[];
}

interface StatusStyles {
  [key: string]: string;
}

interface StatusLabels {
  [key: string]: string;
}

export function RequestsTable({ data }: Readonly<RequestsTableProps>) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
        <div className="bg-gray-100 p-4 rounded-full mb-4">
          <Filter className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No requests found
        </h3>
        <p className="text-gray-500 max-w-md">
          There are no organization requests matching your current filters.
        </p>
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a: OrganizationRequest, b: OrganizationRequest) => {
      if (sortConfig.key === 'createdAt') {
        return sortConfig.direction === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      // Handle nested properties like requesterId.email
      if (sortConfig.key === 'requesterId') {
        const aEmail = a.requesterId?.email ?? '';
        const bEmail = b.requesterId?.email ?? '';
        return sortConfig.direction === 'asc'
          ? aEmail.localeCompare(bEmail)
          : bEmail.localeCompare(aEmail);
      }

      // Safe type checking for other properties
      const aValue = String(a[sortConfig.key] ?? '');
      const bValue = String(b[sortConfig.key] ?? '');

      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    },
  );

  const requestSort = (key: SortKey): void => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName: SortKey): JSX.Element => {
    if (sortConfig.key !== columnName) {
      return (
        <ChevronDown className="h-4 w-4 text-gray-400 ml-1 opacity-0 group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600 ml-1" />
    );
  };

  const getStatusBadge = (status: string): JSX.Element => {
    const statusStyles: StatusStyles = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      approved: 'bg-green-50 text-green-700 border-green-200',
      approved_with_changes: 'bg-purple-50 text-purple-700 border-purple-200',
      rejected: 'bg-red-50 text-red-700 border-red-200',
    };

    const statusLabels: StatusLabels = {
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

  const handleRowClick = (id: string) => {
    router.push(`/admin/dashboard/organization-requests/${id}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm mt-6">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => requestSort('organizationName')}
              >
                <div className="flex items-center">
                  Name
                  {getSortIcon('organizationName')}
                </div>
              </th>
              <th
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => requestSort('status')}
              >
                <div className="flex items-center">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => requestSort('ownerEmail')}
              >
                <div className="flex items-center">
                  Owner Email
                  {getSortIcon('ownerEmail')}
                </div>
              </th>
              <th
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => requestSort('requesterId')}
              >
                <div className="flex items-center">
                  Requester
                  {getSortIcon('requesterId')}
                </div>
              </th>
              <th
                scope="col"
                className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => requestSort('createdAt')}
              >
                <div className="flex items-center">
                  Created At
                  {getSortIcon('createdAt')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map(request => (
              <tr
                key={request._id}
                onClick={() => handleRowClick(request._id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {request.organizationName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.ownerEmail}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {request.requesterId.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(request.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
