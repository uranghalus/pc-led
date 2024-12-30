'use client';
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface NavProps extends React.HTMLAttributes<HTMLElement> {
  className?: string; // className opsional
}

const menu = [
  {
    title: 'Dashboard',
    href: '/',
  },
  {
    title: 'Jadwal PC',
    href: '/jadwal-pc',
  },
  {
    title: 'Setting',
    href: '/settings',
  },
];

const MainNav: React.FC<NavProps> = ({ className, ...props }) => {
  const pathname = usePathname();

  return (
    <nav
      className={cn('flex items-center space-x-4 lg:space-x-6', className)}
      {...props}
    >
      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            pathname === item.href ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default MainNav;
