"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type Availability = {
  _id: string;
  dayOfWeek: number;
  start: string;
  end: string;
  slotMinutes: number;
  isClosed: boolean;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminAvailabilityPage() {
  const [rows, setRows] = useState<Availability[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("17:00");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [isClosed, setIsClosed] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    const data = await apiFetch("/api/availability");
    setRows(data.availability || []);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e: any) {
        setErr(e.message);
        router.push("/dashboard");
      }
    })();
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    try {
      await apiFetch("/api/availability", {
        method: "POST",
        body: JSON.stringify({ dayOfWeek, start, end, slotMinutes, isClosed }),
      });
      setMsg("Saved ✅");
      await load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin – Availability</h1>

      <form onSubmit={save} className="border rounded-xl p-4 space-y-3 max-w-xl">
        {err && <p className="text-sm text-red-600">{err}</p>}
        {msg && <p className="text-sm text-green-700">{msg}</p>}

        <div className="space-y-1">
          <label className="text-sm">Day</label>
          <select
            className="border rounded p-2 w-full"
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(Number(e.target.value))}
          >
            {DAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Start</label>
            <input
              className="border rounded p-2 w-full"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="09:00"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">End</label>
            <input
              className="border rounded p-2 w-full"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="17:00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm">Slot minutes</label>
            <input
              className="border rounded p-2 w-full"
              type="number"
              value={slotMinutes}
              onChange={(e) => setSlotMinutes(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              checked={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
            />
            <span className="text-sm">Closed</span>
          </div>
        </div>

        <button className="border rounded px-3 py-2">Save</button>
      </form>

      <div className="space-y-2">
        <h2 className="font-medium">Current availability</h2>

        {rows.length === 0 && (
          <p className="text-sm text-gray-600">No availability set yet.</p>
        )}

        {rows.map((r) => (
          <div key={r._id} className="border rounded p-3 text-sm">
            {DAYS[r.dayOfWeek]}:{" "}
            {r.isClosed ? "Closed" : `${r.start} - ${r.end} (${r.slotMinutes}m)`}
          </div>
        ))}
      </div>
    </div>
  );
}
