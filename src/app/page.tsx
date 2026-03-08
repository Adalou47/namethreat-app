import { GetStartedButton } from "@/components/get-started-button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#ffffff] px-6 pb-16 pt-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#6b6b6b]">
          The Human Risk Intelligence Platform
        </p>
        <h1 className="mb-4 text-balance text-4xl font-semibold tracking-tight text-[#000000] sm:text-5xl">
          Protect your organisation from social engineering.
        </h1>
        <p className="mb-8 max-w-2xl text-balance text-sm text-[#6b6b6b] sm:text-base">
          Built for MSPs and modern security teams to understand, monitor, and reduce human
          risk across your organisation.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <GetStartedButton />
          <button className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#000000] transition-colors hover:bg-[#f5f5f5]">
            Talk to sales
          </button>
        </div>
      </section>
    </main>
  );
}
