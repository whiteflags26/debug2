import { Permission } from './types';

interface CreateRoleModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => void;
  readonly permissions: readonly Permission[];
  readonly selectedPermissions: readonly string[];
  readonly togglePermission: (id: string) => void;
  readonly name: string;
  readonly setName: (name: string) => void;
  readonly isDefault: boolean;
  readonly setIsDefault: (isDefault: boolean) => void;
}

export default function CreateRoleModal({
  isOpen,
  onClose,
  onSubmit,
  permissions,
  selectedPermissions,
  togglePermission,
  name,
  setName,
  isDefault,
  setIsDefault,
}: Readonly<CreateRoleModalProps>) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Create New Role
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="roleName"
                className="block text-sm font-medium text-gray-700"
              >
                Role Name
              </label>
              <input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm sm:text-sm text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">
                  Permissions
                </legend>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {permissions.map(permission => (
                    <div key={permission._id} className="flex items-start">
                      <input
                        id={`permission-${permission._id}`}
                        type="checkbox"
                        checked={selectedPermissions.includes(permission._id)}
                        onChange={() => togglePermission(permission._id)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <div className="ml-2 text-sm">
                        <label
                          htmlFor={`permission-${permission._id}`}
                          className="font-medium text-gray-700"
                        >
                          {permission.name}
                        </label>
                        {permission.description && (
                          <p className="text-gray-500">
                            {permission.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
            <div className="flex items-start">
              <input
                id="defaultRole"
                type="checkbox"
                checked={isDefault}
                onChange={e => setIsDefault(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
              <div className="ml-2 text-sm">
                <label
                  htmlFor="defaultRole"
                  className="font-medium text-gray-700"
                >
                  Default Role
                </label>
                <p className="text-gray-500">
                  Make this a default role for new users
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
