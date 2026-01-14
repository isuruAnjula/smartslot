"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type BookingStatus = "pending" | "confirmed" | "cancelled";

type Booking = {
  _id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  notes?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch("/api/bookings/mine");
      setBookings(data.bookings || []);
    } catch (e: any) {
      setErr(e.message || "Failed to load bookings");
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking(id: string) {
    setErr(null);
    setActionId(id);
    try {
      await apiFetch(`/api/bookings/${id}/cancel`, { method: "PATCH" });
      await load(); // refresh list after cancel
    } catch (e: any) {
      setErr(e.message || "Failed to cancel booking");
    } finally {
      setActionId(null);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Bookings</h1>
        <Link className="underline" href="/bookings/new">
          New Booking
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-sm text-gray-600">No bookings yet.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="border rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">
                  {new Date(b.startTime).toLocaleString()} →{" "}
                  {new Date(b.endTime).toLocaleString()}
                </p>
                {b.notes && <p className="text-sm text-gray-700">{b.notes}</p>}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs border rounded px-2 py-1">{b.status}</span>

                {b.status !== "cancelled" && (
                  <button
                    className="border rounded px-3 py-1 text-sm disabled:opacity-50"
                    disabled={actionId === b._id}
                    onClick={() => cancelBooking(b._id)}
                    title="Cancel this booking"
                  >
                    {actionId === b._id ? "Cancelling..." : "Cancel"}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
