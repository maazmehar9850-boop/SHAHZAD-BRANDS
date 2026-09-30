import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ orderNumber: string }> };

export default async function OrderConfirmationPage({ params }: Props) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true, invoice: true },
  });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle2 className="mx-auto h-16 w-16 text-green-600" />
      <h1 className="mt-4 text-2xl font-bold text-[var(--color-primary)]">Thank you for your order!</h1>
      <p className="mt-2 text-foreground/70">
        Order <strong>{order.orderNumber}</strong> placed on {formatDateTime(order.createdAt)}.
      </p>
      <p className="mt-4 text-lg font-semibold">Total: {formatMoney(order.total)}</p>
      {order.invoice && (
        <p className="text-sm text-foreground/60">Invoice: {order.invoice.invoiceNumber}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/products">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
        <Link href="/account/orders">
          <Button>View my orders</Button>
        </Link>
      </div>
    </div>
  );
}
