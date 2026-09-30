"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

type Settings = Record<string, string>;

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((json) => json.success && setSettings(json.data));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    setLoading(false);
    if (json.success) toast.success("Settings saved");
    else toast.error(json.error);
  }

  const fields = [
    "store_name",
    "store_address",
    "store_phone",
    "store_email",
    "tax_rate",
    "shipping_flat",
    "invoice_prefix",
    "order_prefix",
    "seo_description",
  ];

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="p-6">
        <Card className="max-w-2xl">
          <CardBody>
            <form onSubmit={save} className="space-y-4">
              {fields.map((key) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium uppercase text-foreground/50">
                    {key.replace(/_/g, " ")}
                  </label>
                  <Input
                    value={settings[key] ?? ""}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                </div>
              ))}
              <Button type="submit" loading={loading}>
                Save settings
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
