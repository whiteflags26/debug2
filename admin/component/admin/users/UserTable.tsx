import { format } from 'date-fns';
import { Settings, User as UserIcon } from 'lucide-react';
import React from 'react';
import { User } from './types';

interface Props {
  users: User[];
  canAssignRoles: boolean;
  onAssignClick: (user: User) => void;
  assigningUser?: string; // Add this prop
}

const UserTable: React.FC<Props> = ({
  users,
  canAssignRoles,
  onAssignClick,
  assigningUser,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Users List
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-gray-900">
                Name
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Created At
              </th>
              {canAssignRoles && (
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 pr-6">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm text-gray-900">
                  {user.first_name + ' ' + user.last_name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {format(new Date(user.createdAt), 'PPP')}
                </td>
                {canAssignRoles && (
                  <td className="whitespace-nowrap py-4 pl-3 pr-6 text-right">
                    <button
                      onClick={() => onAssignClick(user)}
                      disabled={assigningUser === user._id}
                      className={`inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md 
                    ${
                      assigningUser === user._id
                        ? 'bg-gray-100 cursor-not-allowed'
                        : 'bg-white hover:bg-gray-50'
                    } 
                    text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
                    >
                      <Settings className="w-4 h-4 mr-1.5" />
                      {assigningUser === user._id
                        ? 'Assigning...'
                        : 'Manage Role'}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && (
        <div className="text-center py-6 text-gray-500">No users found</div>
      )}
    </div>
  );
};

export default UserTable;
