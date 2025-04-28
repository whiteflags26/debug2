import NavigationLink from './NavigationLink';

interface NavigationItem {
  readonly name: string;
  readonly href: string;
}

interface User {
  readonly name?: string;
  readonly email?: string;
}

interface Props {
  readonly navigation: readonly NavigationItem[];
  readonly logout: () => void;
  readonly user: User | null;
}

export default function AdminSidebar({ navigation, logout, user }: Props) {
  const initial = user?.name?.charAt(0) ?? user?.email?.charAt(0) ?? 'U';

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-gray-800">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center px-4">
            <span className="text-white font-semibold text-xl">
              Admin Panel
            </span>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map(item => (
              <NavigationLink key={item.name} {...item} />
            ))}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="inline-block h-9 w-9 rounded-full bg-gray-700 text-gray-200 items-center justify-center">
                {initial}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.name ?? user?.email}
                </p>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-gray-300 hover:text-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
