"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

const CLIENT_BANDS = [
  "1-10",
  "11-25",
  "26-50",
  "51-100",
  "100+",
] as const;

type MspForm = {
  msp_name: string;
  website: string;
  country: string;
  phone: string;
  number_of_clients: string;
};

const defaultForm: MspForm = {
  msp_name: "",
  website: "",
  country: "",
  phone: "",
  number_of_clients: "",
};

export default function OnboardingMspPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<MspForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof MspForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof MspForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const next: Partial<Record<keyof MspForm, string>> = {};
    if (!form.msp_name.trim()) next.msp_name = "MSP company name is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.number_of_clients) next.number_of_clients = "Number of clients is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_type: "msp",
          organisation_name: form.msp_name,
          website: form.website || undefined,
          country: form.country,
          phone: form.phone || undefined,
          size_band: form.number_of_clients,
          industry: null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ msp_name: (data as { error?: string }).error || "Something went wrong." });
        return;
      }
      if ((data as { success?: boolean }).success !== true) {
        setErrors({ msp_name: (data as { error?: string }).error || "Setup did not complete. Please try again." });
        return;
      }
      router.push("/dashboard");
    } catch {
      setErrors({ msp_name: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ffffff] px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-8">
          <p className="mb-2 text-xs font-medium text-[#6b6b6b]">
            Step {step} of 2
          </p>
          <div className="h-1 w-full rounded-full bg-[#e5e5e5]">
            <div
              className="h-full rounded-full bg-[#000000] transition-all"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />
          </div>
        </div>

        {step === 1 && (
          <>
            <h1 className="mb-1 text-xl font-semibold text-[#000000]">
              Your MSP details
            </h1>
            <p className="mb-6 text-sm text-[#6b6b6b]">
              Tell us about your company.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  MSP company name <span className="text-[#b91c1c]">*</span>
                </label>
                <input
                  type="text"
                  value={form.msp_name}
                  onChange={(e) => update("msp_name", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
                  placeholder="Acme IT Solutions"
                />
                {errors.msp_name && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.msp_name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Website
                </label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
                  placeholder="https://acme-it.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Country <span className="text-[#b91c1c]">*</span>
                </label>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] focus:border-[#000000] focus:outline-none"
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.country}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Phone
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Number of clients <span className="text-[#b91c1c]">*</span>
                </label>
                <select
                  value={form.number_of_clients}
                  onChange={(e) => update("number_of_clients", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] focus:border-[#000000] focus:outline-none"
                >
                  <option value="">Select</option>
                  {CLIENT_BANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.number_of_clients && (
                  <p className="mt-1 text-xs text-[#b91c1c]">
                    {errors.number_of_clients}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="rounded-[4px] bg-[#000000] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="mb-1 text-xl font-semibold text-[#000000]">
              Your MSP workspace is ready
            </h1>
            <p className="mb-6 text-sm text-[#6b6b6b]">
              Review your details below.
            </p>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4 text-sm">
              <p className="font-medium text-[#000000]">{form.msp_name}</p>
              {form.website && (
                <p className="mt-1 text-[#6b6b6b]">{form.website}</p>
              )}
              <p className="mt-1 text-[#6b6b6b]">
                {COUNTRIES.find((c) => c.code === form.country)?.name ?? form.country}
              </p>
              {form.phone && (
                <p className="mt-1 text-[#6b6b6b]">{form.phone}</p>
              )}
              <p className="mt-1 text-[#6b6b6b]">
                Clients: {form.number_of_clients}
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-[4px] border border-[#e5e5e5] bg-white px-5 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-[4px] bg-[#000000] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-50"
              >
                {submitting ? "Setting up…" : "Go to Dashboard"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
