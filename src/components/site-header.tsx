"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="flex items-center justify-between border-b border-[#e5e5e5] bg-white px-8 py-4">
      <Link href="/" className="text-sm font-semibold tracking-tight text-[#000000]">
        <span className="inline-flex items-center rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-[#6b6b6b]">
          namethreat
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-[4px] bg-[#000000] px-4 py-2 text-sm font-medium text-white shadow-sm shadow-[#0000000a] transition-colors hover:bg-[#111111]">
              Sign in
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </header>
  );
}

