import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-2xl font-semibold">SmartSlot</h1>

      <div className="flex flex-wrap gap-4 underline">
        <Link href="/register">Register</Link>
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/bookings">My Bookings</Link>

        <Link href="/admin/availability">Admin Availability</Link>
        <Link href="/admin/bookings">Admin Bookings</Link>
      </div>
    </main>
  );
}
