import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T>({
  columns,
  rows,
  keyFn,
  empty = "No records",
}: {
  columns: Column<T>[];
  rows: T[];
  keyFn: (row: T) => string;
  empty?: string;
}) {
  if (!rows.length) {
    return <p className="py-8 text-center text-sm text-foreground/50">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={cn("px-4 py-3 font-semibold text-foreground/70", c.className)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={keyFn(row)} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/30">
              {columns.map((c) => (
                <td key={c.key} className={cn("px-4 py-3", c.className)}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
