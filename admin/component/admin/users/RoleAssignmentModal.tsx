import React from 'react';
import { Role, User } from './types';

interface Props {
  user: User;
  roles: Role[];
  selectedRole: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onAssign: () => void;
}

const RoleAssignmentModal: React.FC<Props> = ({
  user,
  roles,
  selectedRole,
  onClose,
  onChange,
  onAssign,
}) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Assign Global Role to {user.first_name}
        </h3>
        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Select Role
          </label>
          <select
            id="role"
            name="role"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md text-gray-900"
            value={selectedRole}
            onChange={e => onChange(e.target.value)}
          >
            <option value="" className="text-gray-900">
              -- Select Role --
            </option>
            {roles.map(role => (
              <option key={role._id} value={role._id} className="text-gray-900">
                {role.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 hover:text-gray-900"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
            onClick={onAssign}
            disabled={!selectedRole}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
