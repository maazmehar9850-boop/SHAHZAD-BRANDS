import { prisma } from "@/lib/db";
import { roleDefaultPermissions } from "@/lib/permissions";

export async function resolveStaffSession(userId: string) {
  const staff = await prisma.staffProfile.findUnique({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  if (!staff) return null;

  const keys = staff.role.permissions.map((rp) => rp.permission.key);
  let permissions: string[];
  if (staff.role.slug === "super-admin") {
    permissions = ["*"];
  } else if (keys.length > 0) {
    permissions = keys;
  } else {
    permissions = roleDefaultPermissions(staff.role.slug);
  }

  return {
    roleSlug: staff.role.slug,
    permissions,
    staffProfileId: staff.id,
  };
}
