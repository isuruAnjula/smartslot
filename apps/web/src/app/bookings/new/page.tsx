"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

function toISO(value: string) {
  // datetime-local => convert to ISO (UTC)
  const d = new Date(value);
  return d.toISOString();
}

export default function NewBookingPage() {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!startTime || !endTime) return setErr("Pick start and end time.");

    setSaving(true);
    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          startTime: toISO(startTime),
          endTime: toISO(endTime),
          notes,
        }),
      });
      router.push("/bookings");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create Booking</h1>
        <Link className="underline" href="/bookings">Back</Link>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 border rounded-xl p-4">
        {err && <p className="text-sm text-red-600">{err}</p>}

        <div className="space-y-1">
          <label className="text-sm">Start</label>
          <input
            className="w-full border rounded p-2"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">End</label>
          <input
            className="w-full border rounded p-2"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Notes</label>
          <textarea
            className="w-full border rounded p-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button disabled={saving} className="border rounded px-3 py-2">
          {saving ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
