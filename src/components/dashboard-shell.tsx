"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignOutButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  Mail,
  LayoutGrid,
  Target,
  BookOpen,
  Shield,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Employees", href: "/dashboard/employees", icon: Users },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Mail },
  { label: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
  { label: "Phishing Results", href: "/dashboard/results", icon: Target },
  { label: "Training", href: "/dashboard/training", icon: BookOpen },
  { label: "Domain Intelligence", href: "/dashboard/domains", icon: Shield },
  { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type DashboardShellProps = {
  orgName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function DashboardShell({ orgName, userEmail, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#ffffff] text-[#000000]">
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
        className={`fixed left-0 top-0 z-50 flex h-full w-[240px] flex-col border-r border-[#e5e5e5] bg-white transition-transform md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3 md:px-6 md:py-5">
            <span className="text-lg font-bold text-[#000000]">namethreat</span>
            <button
              type="button"
              className="rounded p-2 text-[#6b6b6b] hover:bg-[#f5f5f5] md:hidden"
              aria-label="Close menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-4">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-[4px] px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#000000] text-white"
                      : "text-[#000000] hover:bg-[#f5f5f5]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#e5e5e5] px-4 py-4">
            <p className="truncate px-2 text-xs text-[#6b6b6b]" title={userEmail}>
              {userEmail}
            </p>
            <SignOutButton>
              <button
                type="button"
                className="mt-2 w-full rounded-[4px] bg-[#000000] px-3 py-2 text-xs font-medium text-white hover:bg-[#111111]"
              >
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col pl-0 md:pl-[240px]">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 py-4 md:px-6">
          <button
            type="button"
            className="mr-2 rounded p-2 text-[#6b6b6b] hover:bg-[#f5f5f5] md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-[#000000]">{orgName}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-[4px] p-2 text-[#6b6b6b] hover:bg-[#f5f5f5] hover:text-[#000000]"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
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
