import { prisma } from "./db";

export async function logActivity(params: {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}) {
  await prisma.activityLog.create({ data: params });
}
