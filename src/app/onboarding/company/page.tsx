"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COUNTRIES } from "@/lib/countries";

const INDUSTRIES = [
  "Construction",
  "Pharma",
  "Legal",
  "IT/Tech",
  "Finance",
  "Healthcare",
  "Manufacturing",
  "Retail",
  "Education",
  "Government",
  "Other",
] as const;

const EMPLOYEE_BANDS = [
  "1-50",
  "51-200",
  "201-500",
  "501-2000",
  "2000+",
] as const;

type CompanyForm = {
  company_name: string;
  domain: string;
  country: string;
  industry: string;
  employee_count: string;
};

const defaultForm: CompanyForm = {
  company_name: "",
  domain: "",
  country: "",
  industry: "",
  employee_count: "",
};

export default function OnboardingCompanyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<CompanyForm>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CompanyForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof CompanyForm, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateStep1 = (): boolean => {
    const next: Partial<Record<keyof CompanyForm, string>> = {};
    if (!form.company_name.trim()) next.company_name = "Company name is required.";
    if (!form.domain.trim()) next.domain = "Company domain is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.industry) next.industry = "Industry is required.";
    if (!form.employee_count) next.employee_count = "Employee count is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleNext = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_type: "direct",
          organisation_name: form.company_name,
          domain: form.domain.replace(/^https?:\/\//i, "").replace(/\/$/, ""),
          country: form.country,
          industry: form.industry,
          size_band: form.employee_count,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ company_name: data.error || "Something went wrong." });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ company_name: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#ffffff] px-4 py-8">
      <div className="mx-auto max-w-lg">
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
              Your company details
            </h1>
            <p className="mb-6 text-sm text-[#6b6b6b]">
              Tell us about your organisation.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Company name <span className="text-[#b91c1c]">*</span>
                </label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
                  placeholder="Acme Ltd"
                />
                {errors.company_name && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.company_name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Company domain <span className="text-[#b91c1c]">*</span>
                </label>
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) => update("domain", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
                  placeholder="company.com"
                />
                {errors.domain && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.domain}</p>
                )}
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
                  Industry <span className="text-[#b91c1c]">*</span>
                </label>
                <select
                  value={form.industry}
                  onChange={(e) => update("industry", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] focus:border-[#000000] focus:outline-none"
                >
                  <option value="">Select industry</option>
                  {INDUSTRIES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.industry}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#000000]">
                  Employee count <span className="text-[#b91c1c]">*</span>
                </label>
                <select
                  value={form.employee_count}
                  onChange={(e) => update("employee_count", e.target.value)}
                  className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] focus:border-[#000000] focus:outline-none"
                >
                  <option value="">Select</option>
                  {EMPLOYEE_BANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.employee_count && (
                  <p className="mt-1 text-xs text-[#b91c1c]">{errors.employee_count}</p>
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
              Your workspace is ready
            </h1>
            <p className="mb-6 text-sm text-[#6b6b6b]">
              Review your details below.
            </p>
            <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4 text-sm">
              <p className="font-medium text-[#000000]">{form.company_name}</p>
              <p className="mt-1 text-[#6b6b6b]">{form.domain}</p>
              <p className="mt-1 text-[#6b6b6b]">
                {COUNTRIES.find((c) => c.code === form.country)?.name ?? form.country}
              </p>
              <p className="mt-1 text-[#6b6b6b]">{form.industry}</p>
              <p className="mt-1 text-[#6b6b6b]">Employees: {form.employee_count}</p>
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
