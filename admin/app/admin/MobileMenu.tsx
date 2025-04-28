'use client';

import NavigationLink from './NavigationLink';

interface NavigationItem {
  readonly name: string;
  readonly href: string;
}

interface Props {
  readonly navigation: readonly NavigationItem[];
  readonly logout: () => void;
  readonly menuOpen: boolean;
  readonly setMenuOpen: (open: boolean) => void;
}

export default function MobileMenu({
  navigation,
  logout,
  menuOpen,
  setMenuOpen,
}: Props) {
  return (
    <div className="bg-gray-800 lg:hidden">
      <div className="px-4 py-5 flex items-center justify-between">
        <span className="text-white font-semibold text-lg">Admin Panel</span>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-gray-300 hover:text-white focus:outline-none"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map(item => (
            <NavigationLink key={item.name} {...item} />
          ))}
          <button
            onClick={logout}
            className="text-gray-300 hover:bg-gray-700 hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
