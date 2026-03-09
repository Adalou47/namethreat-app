import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function TemplatePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const supabase = createSupabaseServiceClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("organisation_id")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (!dbUser?.organisation_id) redirect("/onboarding/msp");

  const { id } = await params;
  const { data: template } = await supabase
    .from("phishing_templates")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!template) notFound();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#000000]">{template.name ?? "Template"}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {template.category && (
              <span className="rounded-[4px] bg-[#f5f5f5] px-2 py-1 text-xs text-[#6b6b6b]">
                {template.category}
              </span>
            )}
            {template.difficulty && (
              <span
                className={`rounded-[4px] px-2 py-1 text-xs font-medium ${
                  template.difficulty === "Easy"
                    ? "bg-green-100 text-green-800"
                    : template.difficulty === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {template.difficulty}
              </span>
            )}
            {template.target_country && (
              <span className="rounded-[4px] bg-[#f5f5f5] px-2 py-1 text-xs text-[#6b6b6b]">
                {template.target_country}
              </span>
            )}
            {template.language && (
              <span className="rounded-[4px] bg-[#f5f5f5] px-2 py-1 text-xs text-[#6b6b6b]">
                {template.language}
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/campaigns/new?template_id=${template.id}`}
          className="rounded-[4px] bg-[#000000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#111111]"
        >
          Use this template
        </Link>
      </header>

      <div className="space-y-4 rounded-[6px] border border-[#e5e5e5] bg-[#f5f5f5] p-6">
        {template.subject && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
              Subject line
            </p>
            <p className="mt-1 text-[#000000]">{template.subject}</p>
          </div>
        )}
        {template.sender_name && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
              Sender name
            </p>
            <p className="mt-1 text-[#000000]">{template.sender_name}</p>
          </div>
        )}
        {template.preview_text && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
              Preview text
            </p>
            <p className="mt-1 text-[#6b6b6b]">{template.preview_text}</p>
          </div>
        )}
        {template.body_html && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[#6b6b6b]">
              Email body
            </p>
            <div className="overflow-hidden rounded-[4px] border border-[#e5e5e5] bg-white">
              <iframe
                title="Email preview"
                srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="margin:0;padding:16px;font-family:sans-serif;">${template.body_html}</body></html>`}
                className="h-[400px] w-full"
                sandbox="allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
