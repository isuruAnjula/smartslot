"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type Slot = { startTime: string; endTime: string };

function formatLocal(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function NewBookingPage() {
  const router = useRouter();

  const [date, setDate] = useState(todayYYYYMMDD());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const tzOffsetMinutes = useMemo(() => new Date().getTimezoneOffset() * -1, []);

  async function loadSlots() {
    setErr(null);
    setMsg(null);
    setSelected(null);
    setLoading(true);

    try {
      const data = await apiFetch(`/api/slots?date=${date}&tzOffsetMinutes=${tzOffsetMinutes}`);
      setSlots(data.slots || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  async function book() {
    if (!selected) return;

    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      await apiFetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          startTime: selected.startTime,
          endTime: selected.endTime,
          notes: notes.trim() || undefined,
        }),
      });

      setMsg("Booking created ✅");
      // go to bookings list
      setTimeout(() => router.push("/bookings"), 500);
    } catch (e: any) {
      setErr(e.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Book a Slot</h1>

      <div className="max-w-md space-y-2">
        <label className="text-sm">Select date</label>
        <input
          className="border rounded p-2 w-full"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {err && <p className="text-sm text-red-600">{err}</p>}
      {msg && <p className="text-sm text-green-700">{msg}</p>}

      <div className="space-y-2">
        <h2 className="font-medium">Available slots</h2>

        {loading && <p className="text-sm text-gray-600">Loading...</p>}

        {!loading && slots.length === 0 && (
          <p className="text-sm text-gray-600">No available slots for this date.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {slots.map((s) => {
            const isSelected =
              selected?.startTime === s.startTime && selected?.endTime === s.endTime;

            return (
              <button
                key={s.startTime}
                onClick={() => setSelected(s)}
                className={`border rounded px-3 py-2 text-sm ${
                  isSelected ? "bg-black text-white" : ""
                }`}
              >
                {formatLocal(s.startTime)} - {formatLocal(s.endTime)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-xl space-y-2">
        <label className="text-sm">Notes (optional)</label>
        <textarea
          className="border rounded p-2 w-full"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any message for the appointment..."
        />
      </div>

      <button
        onClick={book}
        disabled={!selected || loading}
        className="border rounded px-4 py-2 disabled:opacity-50"
      >
        Confirm Booking
      </button>
    </div>
  );
}
