"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LayoutDashboard,
  Calendar,
  FileText,
  LogOut,
  Map,
  DollarSign,
  Users,
} from "lucide-react";
import { logoutAction } from "@/actions/auth.action";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = {
  admin: [
    { title: "Jenis Lapangan", href: "/jenis-lapangan", icon: Map },
    { title: "Lapangan", href: "/lapangan", icon: LayoutDashboard },
    { title: "User", href: "/user", icon: Users },
    { title: "Rekap Pendapatan", href: "/rekap", icon: DollarSign },
    { title: "Audit Log", href: "/audit-log", icon: FileText },
  ],
  petugas: [
    { title: "Jadwal Lapangan", href: "/jadwal", icon: Calendar },
    { title: "Daftar Booking", href: "/daftar-booking", icon: FileText },
  ],
  penyewa: [
    { title: "Jadwal Lapangan", href: "/jadwal", icon: Calendar },
    { title: "Booking Saya", href: "/booking-saya", icon: FileText },
  ],
};

export function DashboardSidebar({
  user,
}: {
  user: { username: string; role: string };
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentMenu = menuItems[user.role as keyof typeof menuItems] || [];

  const NavLinks = () => (
    <nav className="space-y-1 mt-6">
      {currentMenu.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <span className="font-bold text-lg">Sewa Lapangan</span>
      </div>

      <div className="flex-1">
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Menu {user.role}
        </p>
        <NavLinks />
      </div>

      <div className="mt-auto border-t pt-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-2 h-auto py-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="uppercase">
                    {user.username.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium leading-none">
                    {user.username}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize mt-1">
                    {user.role}
                  </span>
                </div>
              </Button>
            }
          />

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutAction()}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-64 flex-col border-r bg-white min-h-screen sticky top-0">
        <SidebarContent />
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <span className="font-bold">Sewa Lapangan</span>
        </div>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      <div className="md:hidden h-16 w-full" />
    </>
  );
}
