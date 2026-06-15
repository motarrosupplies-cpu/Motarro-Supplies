"use client";
import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar, { sidebarLinks } from '@/components/admin/AdminSidebar';
import { AdminAuthGuard } from '@/components/admin/AdminAuthGuard';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Link from 'next/link';

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminShell({ children }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <div className="w-full lg:hidden fixed top-0 left-0 z-50 bg-white border-b flex items-center h-14 px-4">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <Menu className="h-7 w-7" />
              <span className="sr-only">Open admin menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SheetTitle className="p-4 border-b text-lg font-semibold">Admin Menu</SheetTitle>
            <nav className="flex flex-col gap-2 p-4">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-muted"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    {link.title}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="text-lg font-semibold ml-2">Admin Dashboard</span>
      </div>
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full flex-col gap-y-5">
          <div className="flex h-16 shrink-0 items-center border-b px-6">
            <span className="text-lg font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex-1">
            <AdminSidebar />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="h-full px-4 py-6 lg:px-6 pt-16 lg:pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';

  if (isLoginRoute) {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <AdminShell>{children}</AdminShell>
    </AdminAuthGuard>
  );
}
