"use client";

import { UserButton } from "@clerk/nextjs";

export function DashboardTopBar() {
  return (
    <header className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-[#000000]">Overview</h1>
        <p className="text-xs text-[#6b6b6b]">
          Human risk across your organisation at a glance.
        </p>
      </div>
      <UserButton />
    </header>
  );
}

