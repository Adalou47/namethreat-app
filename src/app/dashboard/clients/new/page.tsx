"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

const EMPLOYEE_BANDS = ["1-50", "51-200", "201-500", "501-2000", "2000+"] as const;

type Form = {
  name: string;
  domain: string;
  country: string;
  industry: string;
  size_band: string;
  primary_contact_name: string;
  primary_contact_email: string;
};

const defaultForm: Form = {
  name: "",
  domain: "",
  country: "",
  industry: "",
  size_band: "",
  primary_contact_name: "",
  primary_contact_email: "",
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<Form>(defaultForm);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof Form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<keyof Form, string>> = {};
    if (!form.name.trim()) next.name = "Company name is required.";
    if (!form.domain.trim()) next.domain = "Company domain is required.";
    if (!form.country) next.country = "Country is required.";
    if (!form.industry) next.industry = "Industry is required.";
    if (!form.size_band) next.size_band = "Employee count is required.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          domain: form.domain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, ""),
          country: form.country,
          industry: form.industry,
          size_band: form.size_band,
          primary_contact_name: form.primary_contact_name.trim() || null,
          primary_contact_email: form.primary_contact_email.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        organisation_id?: string;
      };
      if (!res.ok) {
        setErrors({ name: data.error ?? "Something went wrong." });
        return;
      }
      if (data.organisation_id) {
        router.push(`/dashboard/clients/${data.organisation_id}`);
        return;
      }
      setErrors({ name: "Something went wrong." });
    } catch {
      setErrors({ name: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-[#000000]">Add new client</h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">
          Create a client organisation to manage employees and campaigns
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-[#000000]">
            Company name <span className="text-[#b91c1c]">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
            placeholder="Acme Ltd"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-[#b91c1c]">{errors.name}</p>
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
            placeholder="acme.com"
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
            value={form.size_band}
            onChange={(e) => update("size_band", e.target.value)}
            className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] focus:border-[#000000] focus:outline-none"
          >
            <option value="">Select</option>
            {EMPLOYEE_BANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {errors.size_band && (
            <p className="mt-1 text-xs text-[#b91c1c]">{errors.size_band}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#000000]">
            Primary contact name
          </label>
          <input
            type="text"
            value={form.primary_contact_name}
            onChange={(e) => update("primary_contact_name", e.target.value)}
            className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[#000000]">
            Primary contact email
          </label>
          <input
            type="email"
            value={form.primary_contact_email}
            onChange={(e) => update("primary_contact_email", e.target.value)}
            className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-[#000000] placeholder:text-[#6b6b6b] focus:border-[#000000] focus:outline-none"
            placeholder="jane@acme.com"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/clients"
            className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create client"}
          </button>
        </div>
      </form>
    </div>
  );
}
