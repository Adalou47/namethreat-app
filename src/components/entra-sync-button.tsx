"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function EntraSyncButton({ organisationId }: { organisationId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSync() {
    setLoading(true);
    try {
      const res = await fetch("/api/integrations/entra/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organisation_id: organisationId }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleSync}
      disabled={loading}
      className="rounded-lg bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors duration-150 disabled:opacity-60"
    >
      {loading ? "Syncing…" : "Sync Now"}
    </button>
  );
}
