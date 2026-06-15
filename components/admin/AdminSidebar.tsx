// Trivial change to force Vercel cache bust
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Settings,
  BarChart,
  Package,
  CreditCard,
  HelpCircle,
  Menu,
  FileText,
  Receipt,
  UserCheck,
  BookOpen,
  FolderTree,
  Mail,
  QrCode,
  Megaphone,
} from 'lucide-react';

export const sidebarLinks = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Invoicing',
    href: '/admin/invoicing',
    icon: FileText,
  },
  {
    title: 'Categories',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    title: 'Menu Management',
    href: '/admin/menu',
    icon: Menu,
  },
  {
    title: 'Blog Management',
    href: '/admin/blog',
    icon: BookOpen,
  },
  {
    title: 'Newsletter',
    href: '/admin/newsletter',
    icon: Mail,
  },
  {
    title: 'Campaigns',
    href: '/admin/campaigns',
    icon: Megaphone,
  },
  {
    title: 'QR Codes',
    href: '/admin/qr-codes',
    icon: QrCode,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
  },
  {
    title: 'Payments',
    href: '/admin/payments',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Help',
    href: '/admin/help',
    icon: HelpCircle,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-background">
      <nav className="space-y-1 p-4">
        {sidebarLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || 
            (link.href === '/admin/invoicing' && pathname && (
              pathname.startsWith('/admin/invoices') ||
              pathname.startsWith('/admin/quotations') ||
              pathname.startsWith('/admin/credit-notes')
            )) ||
            (link.href === '/admin/qr-codes' && pathname && pathname.startsWith('/admin/qr-codes'));

          return (
            <div key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.title}
              </Link>
              
              {/* Submenu for Invoicing */}
              {link.href === '/admin/invoicing' && isActive && (
                <div className="ml-6 mt-2 space-y-1">
                  <Link
                    href="/admin/invoices"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname && pathname.startsWith('/admin/invoices')
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <FileText className="h-3 w-3" />
                    Invoices
                  </Link>
                  <Link
                    href="/admin/quotations"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname && pathname.startsWith('/admin/quotations')
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Receipt className="h-3 w-3" />
                    Quotations
                  </Link>
                  <Link
                    href="/admin/credit-notes"
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      pathname && pathname.startsWith('/admin/credit-notes')
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <UserCheck className="h-3 w-3" />
                    Credit Notes
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
} 