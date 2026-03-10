"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  Building2,
  Mail,
  LayoutGrid,
  Shield,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";

const MSP_NAV_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clients", href: "/dashboard/clients", icon: Building2 },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const ORG_NAV_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/dashboard/employees", icon: Users },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
  { label: "Domain Intelligence", href: "/dashboard/domains", icon: Shield },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function getNavItems(role: string) {
  return role === "msp_admin" ? MSP_NAV_ITEMS : ORG_NAV_ITEMS;
}

type DashboardShellProps = {
  orgName: string;
  userEmail: string;
  role?: string;
  mspId?: string;
  children: React.ReactNode;
};

export function DashboardShell({ orgName, userEmail, role = "", mspId, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = getNavItems(role);

  return (
    <div className="flex min-h-screen bg-white text-neutral-950">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/20 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 bg-white transition-transform md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col">
          {/* Workspace / brand */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-4">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-neutral-100 p-2">
              <span className="truncate text-sm font-semibold text-neutral-950">namethreat</span>
            </div>
            <button
              type="button"
              className="ml-2 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 md:hidden transition-colors duration-150"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4">
            <p className="px-3 py-2 mt-0 mb-1 text-[11px] font-medium uppercase tracking-wider text-neutral-400">
              Navigation
            </p>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                      isActive
                        ? "bg-neutral-950 text-white font-medium"
                        : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
          <div className="border-t border-neutral-200 px-3 py-4">
            <p className="truncate px-3 text-[13px] text-neutral-500" title={userEmail}>
              {userEmail}
            </p>
            <SignOutButton>
              <button
                type="button"
                className="mt-2 w-full rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-0 md:pl-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-4 md:px-6">
          <button
            type="button"
            className="mr-2 p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 md:hidden transition-colors duration-150"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold text-neutral-950">{orgName}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <UserButton />
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
