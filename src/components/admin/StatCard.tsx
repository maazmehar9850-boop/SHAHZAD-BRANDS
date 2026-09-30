import { LucideIcon } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <Card>
      <CardBody className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-foreground/60">{label}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--color-primary)]">{value}</p>
          {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
        </div>
        <span className="rounded-lg bg-[var(--color-muted)] p-2 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" />
        </span>
      </CardBody>
    </Card>
  );
}
