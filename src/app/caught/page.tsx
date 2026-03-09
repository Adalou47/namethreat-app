import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function CaughtPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-lg px-6 py-12 sm:py-16">
        <div className="flex flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff7ed] text-[#f97316]"
            aria-hidden
          >
            <AlertTriangle className="h-8 w-8" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#000000] sm:text-3xl">
            You clicked a simulated phishing link
          </h1>
          <p className="mt-3 text-base text-[#374151]">
            This was a security test run by your organisation. No harm was done.
          </p>
        </div>

        <div
          className="mt-8 rounded-lg border border-[#fed7aa] bg-[#fff7ed] p-4 text-left"
          role="region"
          aria-label="Important information"
        >
          <p className="text-sm text-[#9a3412]">
            In a real phishing attack, clicking this link could have led to your
            account being compromised or malware being installed on your device.
          </p>
        </div>

        <section className="mt-10 text-left" aria-labelledby="tips-heading">
          <h2
            id="tips-heading"
            className="text-lg font-semibold text-[#000000]"
          >
            How to spot phishing emails
          </h2>
          <ul className="mt-4 space-y-4">
            <li className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
              <h3 className="font-medium text-[#000000]">Check the sender</h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                Look carefully at the email address, not just the display name.
                Attackers use domains that look similar to real ones.
              </p>
            </li>
            <li className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
              <h3 className="font-medium text-[#000000]">Hover before you click</h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                Always hover over links to see the real destination URL before
                clicking.
              </p>
            </li>
            <li className="rounded-lg border border-[#e5e7eb] bg-[#fafafa] p-4">
              <h3 className="font-medium text-[#000000]">When in doubt, don&apos;t</h3>
              <p className="mt-1 text-sm text-[#6b7280]">
                If something feels off, contact your IT team before clicking any
                links.
              </p>
            </li>
          </ul>
        </section>

        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
          >
            Complete your security training →
          </Link>
        </div>

        <p className="mt-12 text-center text-xs text-[#9ca3af]">
          This simulation was conducted by namethreat on behalf of your
          organisation.
        </p>
      </main>
    </div>
  );
}
