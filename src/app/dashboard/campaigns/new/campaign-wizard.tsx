"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Template = {
  id: string;
  name: string | null;
  category: string | null;
  difficulty: string | null;
  target_country: string | null;
  language: string | null;
};

type SendingDomain = {
  id: string;
  domain: string | null;
  reputation_score: number | null;
};

type WizardProps = {
  organisationId: string;
  userId: string;
  templates: Template[];
  sendingDomains: SendingDomain[];
  departments: string[];
  preselectedTemplateId: string | null;
};

export function CampaignWizard({
  organisationId,
  templates,
  sendingDomains,
  departments,
  preselectedTemplateId,
}: WizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState<string | null>(preselectedTemplateId);
  const [campaignName, setCampaignName] = useState("");
  const [targetType, setTargetType] = useState<"all" | "department" | "difficulty">("all");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [targetDifficulty, setTargetDifficulty] = useState<"Easy" | "Medium" | "Hard">("Easy");
  const [sendingDomainId, setSendingDomainId] = useState("");
  const [scheduleType, setScheduleType] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === templateId);

  useEffect(() => {
    if (preselectedTemplateId) setTemplateId(preselectedTemplateId);
  }, [preselectedTemplateId]);

  useEffect(() => {
    if (selectedTemplate) {
      setCampaignName(selectedTemplate.name ?? "");
    }
  }, [selectedTemplate]);

  const canNextStep1 = !!templateId;
  const canNextStep2 =
    campaignName.trim() !== "" &&
    (targetType !== "department" || !!targetDepartment) &&
    !!sendingDomainId &&
    (scheduleType !== "later" || !!scheduledAt);

  const handleLaunch = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organisation_id: organisationId,
          template_id: templateId,
          name: campaignName.trim(),
          target_type: targetType,
          target_department: targetType === "department" ? targetDepartment : null,
          target_difficulty: targetType === "difficulty" ? targetDifficulty : null,
          sending_domain_id: sendingDomainId,
          schedule_type: scheduleType,
          scheduled_at: scheduleType === "later" && scheduledAt ? scheduledAt : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create campaign");
        return;
      }
      router.push(`/dashboard/campaigns/${data.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create campaign");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${step >= s ? "bg-[#000000]" : "bg-[#e5e5e5]"}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#000000]">
            Step 1 — Choose template
          </h2>
          <input
            type="search"
            placeholder="Search templates..."
            className="w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplateId(t.id)}
                className={`rounded-[6px] border-2 p-4 text-left transition-colors ${
                  templateId === t.id
                    ? "border-[#000000] bg-[#f5f5f5]"
                    : "border-[#e5e5e5] bg-[#f5f5f5] hover:border-[#6b6b6b]"
                }`}
              >
                <p className="font-semibold text-[#000000]">{t.name ?? "Unnamed"}</p>
                <p className="mt-1 text-xs text-[#6b6b6b]">
                  {[t.category, t.difficulty].filter(Boolean).join(" · ")}
                </p>
              </button>
            ))}
          </div>
          {!templates.length && (
            <p className="text-sm text-[#6b6b6b]">No templates available.</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canNextStep1}
              className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#000000]">
            Step 2 — Configure campaign
          </h2>
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b]">Campaign name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="e.g. Q1 Phishing Test"
              className="mt-1 w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b]">Target employees</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="target"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                />
                <span className="text-sm text-[#000000]">All employees</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="target"
                  checked={targetType === "department"}
                  onChange={() => setTargetType("department")}
                />
                <span className="text-sm text-[#000000]">By department</span>
              </label>
              {targetType === "department" && (
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="ml-6 rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
                >
                  <option value="">Select department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="target"
                  checked={targetType === "difficulty"}
                  onChange={() => setTargetType("difficulty")}
                />
                <span className="text-sm text-[#000000]">By difficulty</span>
              </label>
              {targetType === "difficulty" && (
                <select
                  value={targetDifficulty}
                  onChange={(e) => setTargetDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                  className="ml-6 rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b]">Sending domain</label>
            <select
              value={sendingDomainId}
              onChange={(e) => setSendingDomainId(e.target.value)}
              className="mt-1 w-full rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
            >
              <option value="">Select domain</option>
              {sendingDomains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.domain ?? d.id}
                  {d.reputation_score != null ? ` (${d.reputation_score})` : ""}
                </option>
              ))}
            </select>
            {!sendingDomains.length && (
              <p className="mt-1 text-xs text-[#6b6b6b]">
                No sending domains available yet. Contact namethreat support.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6b6b6b]">Schedule</label>
            <div className="mt-2 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === "now"}
                  onChange={() => setScheduleType("now")}
                />
                <span className="text-sm text-[#000000]">Send now</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === "later"}
                  onChange={() => setScheduleType("later")}
                />
                <span className="text-sm text-[#000000]">Schedule for later</span>
              </label>
              {scheduleType === "later" && (
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="ml-6 rounded-[4px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#000000]"
                />
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canNextStep2}
              className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#000000]">
            Step 3 — Review & launch
          </h2>
          <div className="rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-4 space-y-2 text-sm">
            <p><span className="text-[#6b6b6b]">Template:</span> {selectedTemplate?.name ?? "—"}</p>
            <p><span className="text-[#6b6b6b]">Target:</span> {targetType === "all" ? "All employees" : targetType === "department" ? targetDepartment : targetDifficulty}</p>
            <p><span className="text-[#6b6b6b]">Sending domain:</span> {sendingDomains.find((d) => d.id === sendingDomainId)?.domain ?? "—"}</p>
            <p><span className="text-[#6b6b6b]">Schedule:</span> {scheduleType === "now" ? "Send now" : scheduledAt ? new Date(scheduledAt).toLocaleString() : "—"}</p>
          </div>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="rounded-[4px] border border-[#e5e5e5] bg-white px-4 py-2.5 text-sm font-medium text-[#000000] hover:bg-[#f5f5f5] disabled:opacity-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              disabled={submitting}
              className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111] disabled:opacity-60"
            >
              {submitting ? "Launching…" : "Launch Campaign"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
