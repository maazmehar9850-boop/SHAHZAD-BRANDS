"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

type StaffRow = {
  id: string;
  employeeId: string;
  role: { name: string };
  user: { name: string; email: string; status: string };
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    employeeId: "",
    roleId: "",
  });
  function load() {
    fetch("/api/admin/staff")
      .then((r) => r.json())
      .then((json) => json.success && setStaff(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Staff created");
      load();
    } else toast.error(json.error);
  }

  return (
    <>
      <AdminHeader title="Staff" />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <DataTable
          rows={staff}
          keyFn={(s) => s.id}
          columns={[
            { key: "name", header: "Name", render: (s) => s.user.name },
            { key: "email", header: "Email", render: (s) => s.user.email },
            { key: "emp", header: "Employee ID", render: (s) => s.employeeId },
            { key: "role", header: "Role", render: (s) => s.role.name },
          ]}
        />
        <Card>
          <CardBody>
            <h2 className="mb-3 font-semibold">Add staff</h2>
            <form onSubmit={create} className="space-y-3">
              <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Input placeholder="Employee ID" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
              <Input placeholder="Role ID (from database seed)" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} required />
              <Button type="submit">Create</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
