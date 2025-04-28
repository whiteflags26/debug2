import { Role } from "./types";


type Props = {
  readonly roles: Role[];
   readonly canDelete: boolean;
   readonly onDelete: (roleId: string) => void;
};

export default function RoleTable({ roles, canDelete, onDelete }: Props) {
  return (
    <div className="mt-8 flex flex-col">
      <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Scope</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Permissions</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Default</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {roles.map((role) => (
                  <tr key={role._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{role.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 capitalize">{role.scope}</td>
                    <td className="px-3 py-4 text-sm text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((perm) => (
                          <span key={perm._id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">{perm.name}</span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{role.isDefault ? 'Yes' : 'No'}</td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      {canDelete && !role.isDefault && (
                        <button onClick={() => onDelete(role._id)} className="text-red-600 hover:text-red-900">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
