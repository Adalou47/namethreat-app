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
  LogOut,
  ChevronsUpDown,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };
type NavSection = { label: string; items: NavItem[] };

const MSP_NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Simulations",
    items: [
      { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
      { label: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Clients", href: "/dashboard/clients", icon: Building2 },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

const ORG_NAV_SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Simulations",
    items: [
      { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
      { label: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
    ],
  },
  { label: "Learning", items: [] },
  {
    label: "Intelligence",
    items: [{ label: "Domain Intelligence", href: "/dashboard/domains", icon: Shield }],
  },
  {
    label: "Management",
    items: [
      { label: "Employees", href: "/dashboard/employees", icon: Users },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function getNavSections(role: string): NavSection[] {
  return role === "msp_admin" ? MSP_NAV_SECTIONS : ORG_NAV_SECTIONS;
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
  const navSections = getNavSections(role);

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
        className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-neutral-200 bg-neutral-50 px-3 py-4 transition-transform md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Workspace switcher */}
        <div className="mb-4 flex min-w-0 shrink-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-100 px-2 py-2 transition-colors hover:bg-neutral-200">
            <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-neutral-800 text-[11px] font-bold text-white">
              N
            </span>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px] font-semibold text-neutral-950">namethreat</span>
              <span className="text-[10px] text-neutral-400">Workspace</span>
            </div>
            <ChevronsUpDown className="ml-auto h-3 w-3 shrink-0 text-neutral-400" />
          </div>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-neutral-500 transition-colors duration-150 hover:bg-neutral-100 hover:text-neutral-950 md:hidden"
            aria-label="Close menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="h-[14px] w-[14px] shrink-0" />
          </button>
        </div>

        {/* Navigation sections */}
        <nav className="flex-1 min-h-0 pt-2">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-0.5 mt-5 px-3 text-[11px] font-medium uppercase tracking-widest text-neutral-400">
                {section.label}
              </p>
              {section.items.length > 0 && (
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] transition-colors duration-150 ${
                          isActive
                            ? "bg-neutral-950 font-medium text-white hover:bg-neutral-950 hover:text-white"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
                        }`}
                      >
                        <Icon className="h-[14px] w-[14px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Bottom: divider, email, sign out */}
        <div className="mt-auto flex flex-col border-t border-neutral-200">
          <p className="truncate px-3 py-2 text-xs text-neutral-400" title={userEmail}>
            {userEmail}
          </p>
          <SignOutButton>
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-[7px] text-[13px] text-neutral-600 transition-colors duration-150 hover:bg-neutral-100"
            >
              <LogOut className="h-[14px] w-[14px] shrink-0" />
              Sign out
            </button>
          </SignOutButton>
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
            <Menu className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-semibold text-neutral-950">{orgName}</h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950 transition-colors duration-150"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
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
