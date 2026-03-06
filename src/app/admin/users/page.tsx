"use client";

import { useEffect, useState } from "react";
import { useAppSession } from "@/components/providers/AppSessionProvider";
import { AdminUserItem } from "@/lib/contracts";

export default function AdminUsersPage() {
  const { user, getAuthHeaders } = useAppSession();
  const [items, setItems] = useState<AdminUserItem[]>([]);
  const [selectedRole, setSelectedRole] = useState("ALL");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") return;
    const query = selectedRole === "ALL" ? "" : `?role=${selectedRole}`;
    fetch(`/api/admin/users${query}`)
      .then((response) => response.json())
      .then((data: { users: AdminUserItem[] }) => setItems(data.users ?? []))
      .catch(() => setItems([]));
  }, [selectedRole, user]);

  async function promoteTeacher(userId: string) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: getAuthHeaders(true),
      body: JSON.stringify({ userId, role: "TEACHER" })
    });
    setItems((prev) => prev.map((item) => (item.id === userId ? { ...item, role: "TEACHER" } : item)));
  }

  if (!user || user.role !== "ADMIN") {
    return <main className="px-4 py-5 text-sm text-slate-700">Admin access only.</main>;
  }

  return (
    <main className="space-y-4 px-4 py-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h1 className="text-base font-semibold text-slate-900">Manage Users</h1>
        <div className="mt-2">
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="ALL">All roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="COUNSELOR">Counselors</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </section>

      <section className="space-y-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-600">
                  {item.email} | {item.role} | {item.institutionName || "No institution"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => promoteTeacher(item.id)}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs text-white"
              >
                Make teacher
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
