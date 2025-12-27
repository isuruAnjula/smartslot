"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

type Booking = {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  user?: { email?: string; name?: string };
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch("/api/bookings/admin");
        setBookings(data.bookings || []);
      } catch (e: any) {
        setErr(e.message);
        router.push("/dashboard");
      }
    })();
  }, [router]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin – All Bookings</h1>
      {err && <p className="text-sm text-red-600">{err}</p>}

      {bookings.length === 0 && (
        <p className="text-sm text-gray-600">No bookings found.</p>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b._id} className="border rounded-xl p-4 space-y-1">
            <p className="text-sm text-gray-600">
              User: {b.user?.email || "unknown"}
            </p>
            <p className="font-medium">
              {new Date(b.startTime).toLocaleString()} →{" "}
              {new Date(b.endTime).toLocaleString()}
            </p>
            <span className="text-xs border rounded px-2 py-1 inline-block">
              {b.status}
            </span>
            {b.notes && <p className="text-sm">{b.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
