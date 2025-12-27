"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  startTime: string;
  endTime: string;
  status: "pending" | "confirmed" | "cancelled";
  notes?: string;
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await apiFetch("/api/bookings/mine");
      setBookings(data.bookings || []);
    } catch (e: any) {
      router.push("/login");
      setErr(e.message);
    } finally {
      setLoading(false);
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
        <Link className="border rounded px-3 py-2" href="/bookings/new">
          + New Booking
        </Link>
      </div>

      {loading && <p>Loading...</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-sm text-gray-600">No bookings yet.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="border rounded-xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <p className="font-medium">
                {new Date(b.startTime).toLocaleString()} →{" "}
                {new Date(b.endTime).toLocaleString()}
              </p>
              <span className="text-xs border rounded px-2 py-1">{b.status}</span>
            </div>
            {b.notes && <p className="text-sm text-gray-700">{b.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
