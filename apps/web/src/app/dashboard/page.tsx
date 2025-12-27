"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch("/api/auth/me");
        setUser(me.user);
      } catch (e: any) {
        setErr(e.message);
        router.push("/login");
      }
    })();
  }, [router]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  if (!user) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-3">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <p className="text-sm">Logged in as: {user.email} ({user.role})</p>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button onClick={logout} className="border rounded p-2">Logout</button>
    </div>
  );
}
