'use client';

import { useEffect, useState } from 'react';
import AdminSidebar from '../AdminSideBar';
import MobileMenu from '../MobileMenu';

interface NavigationItem {
  readonly name: string;
  readonly href: string;
  readonly permission?: string;
}

interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

// Dummy user data
const dummyUser = {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Admin',
} as const;

// Dummy permission checker
const dummyCheckPermission = async (permission: string) => true;

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [navigation, setNavigation] = useState<NavigationItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Dummy logout function
  const handleLogout = () => {
    console.log('Logout clicked');
  };

  useEffect(() => {
    const initNavigation = async () => {
      const allNavItems: NavigationItem[] = [
        { name: 'Dashboard', href: '/admin/dashboard' },
        {
          name: 'Users',
          href: '/admin/dashboard/users',
          permission: 'view_users',
        },
        {
          name: 'Roles',
          href: '/admin/dashboard/roles',
          permission: 'view_roles',
        },
        {
          name: 'Organizations',
          href: '/admin/dashboard/organization-requests',
          permission: 'view_organizations',
        },
        { name: 'Organization Form', href: '/admin/dashboard/organization-form' },
        { name: 'Manage Facilities', href: '/admin/dashboard/facilities' },
        { name: 'Manage Sports', href: '/admin/dashboard/sports' },
        { name: 'Manage Team Size', href: '/admin/dashboard/team_size' }
      ];

      const availableNavItems = await Promise.all(
        allNavItems.map(async item => {
          if (
            !item.permission ||
            (await dummyCheckPermission(item.permission))
          ) {
            return item;
          }
          return null;
        }),
      );

      setNavigation(availableNavItems.filter(Boolean) as NavigationItem[]);
    };

    initNavigation();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <MobileMenu
        navigation={navigation}
        logout={handleLogout}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <AdminSidebar
        navigation={navigation}
        logout={handleLogout}
        user={dummyUser}
      />
      <div className="lg:pl-64 flex flex-col flex-1">
        <main className="flex-1 pb-8">
          <div className="mt-8 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
