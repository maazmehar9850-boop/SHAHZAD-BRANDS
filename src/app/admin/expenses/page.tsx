"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DataTable } from "@/components/admin/DataTable";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatMoney, formatDate } from "@/lib/format";

type Expense = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  staff: { name: string } | null;
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [form, setForm] = useState({
    title: "",
    category: "General",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  function load() {
    fetch("/api/admin/expenses")
      .then((r) => r.json())
      .then((json) => json.success && setExpenses(json.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: Number(form.amount) }),
    });
    const json = await res.json();
    if (json.success) {
      toast.success("Expense recorded");
      load();
    } else toast.error(json.error);
  }

  return (
    <>
      <AdminHeader title="Expenses" />
      <div className="space-y-4 p-6">
        <form onSubmit={create} className="grid max-w-2xl gap-2 sm:grid-cols-4">
          <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <Input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Button type="submit" className="sm:col-span-4 w-fit">Add expense</Button>
        </form>
        <DataTable
          rows={expenses}
          keyFn={(e) => e.id}
          columns={[
            { key: "title", header: "Title", render: (e) => e.title },
            { key: "cat", header: "Category", render: (e) => e.category },
            { key: "amt", header: "Amount", render: (e) => formatMoney(e.amount) },
            { key: "date", header: "Date", render: (e) => formatDate(e.date) },
          ]}
        />
      </div>
    </>
  );
}
