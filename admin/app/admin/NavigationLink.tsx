import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavigationLinkProps {
  readonly name: string;
  readonly href: string;
}

export default function NavigationLink({ name, href }: NavigationLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const baseClasses = 'block px-3 py-2 rounded-md font-medium';
  const activeClass = 'bg-gray-900 text-white';
  const inactiveClass = 'text-gray-300 hover:bg-gray-700 hover:text-white';

  return (
    <Link
      href={href}
      className={`${baseClasses} ${isActive ? activeClass : inactiveClass}`}
    >
      {name}
    </Link>
  );
}
