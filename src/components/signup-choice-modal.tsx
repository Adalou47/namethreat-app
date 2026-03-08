"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Props = { onClose: () => void };

export function SignupChoiceModal({ onClose }: Props) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[6px] border border-[#e5e5e5] bg-white p-6 shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-[#000000]">
          Get started
        </h2>
        <p className="mb-6 text-sm text-[#6b6b6b]">
          Choose how you’ll use namethreat.
        </p>
        <div className="space-y-3">
          <Link
            href="/signup/msp"
            className="flex items-start gap-4 rounded-[6px] border border-[#e5e5e5] bg-white p-4 text-left transition-colors hover:bg-[#f5f5f5]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#000000]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </span>
            <div>
              <p className="font-medium text-[#000000]">I'm an MSP / IT Provider</p>
              <p className="mt-0.5 text-sm text-[#6b6b6b]">I manage security for multiple companies</p>
            </div>
          </Link>
          <Link
            href="/signup/company"
            className="flex items-start gap-4 rounded-[6px] border border-[#e5e5e5] bg-white p-4 text-left transition-colors hover:bg-[#f5f5f5]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] text-[#000000]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
            </span>
            <div>
              <p className="font-medium text-[#000000]">I'm a Company</p>
              <p className="mt-0.5 text-sm text-[#6b6b6b]">I want to protect my own organisation</p>
            </div>
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-[4px] border border-[#e5e5e5] bg-white py-2 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
