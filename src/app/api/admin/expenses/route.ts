import { prisma } from "@/lib/db";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_EXPENSES);
  if (error) return error;

  const expenses = await prisma.expense.findMany({
    include: { staff: { select: { name: true } } },
    orderBy: { date: "desc" },
    take: 100,
  });
  return jsonOk(expenses);
}

export async function POST(req: Request) {
  const { error, session } = await requireStaffApi(PERMISSIONS.MANAGE_EXPENSES);
  if (error) return error;

  const body = await req.json();
  if (!body.title || !body.category || body.amount == null || !body.date) {
    return jsonError("Title, category, amount, and date required", 400);
  }

  const expense = await prisma.expense.create({
    data: {
      title: body.title,
      category: body.category,
      amount: Number(body.amount),
      date: new Date(body.date),
      description: body.description,
      paymentMethod: body.paymentMethod ?? "CASH",
      staffId: session.userId,
      receiptUrl: body.receiptUrl,
    },
  });
  return jsonOk(expense, 201);
}
