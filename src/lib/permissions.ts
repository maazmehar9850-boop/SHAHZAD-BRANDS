export const PERMISSIONS = {
  VIEW_PRODUCTS: "view_products",
  ADD_PRODUCTS: "add_products",
  EDIT_PRODUCTS: "edit_products",
  DELETE_PRODUCTS: "delete_products",
  VIEW_INVENTORY: "view_inventory",
  MANAGE_INVENTORY: "manage_inventory",
  VIEW_ORDERS: "view_orders",
  MANAGE_ORDERS: "manage_orders",
  CREATE_BILLS: "create_bills",
  REFUND_BILLS: "refund_bills",
  VIEW_REPORTS: "view_reports",
  MANAGE_STAFF: "manage_staff",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_CUSTOMERS: "view_customers",
  MANAGE_CUSTOMERS: "manage_customers",
  MANAGE_COUPONS: "manage_coupons",
  MANAGE_EXPENSES: "manage_expenses",
  VIEW_INVOICES: "view_invoices",
  MANAGE_RETURNS: "manage_returns",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS = Object.values(PERMISSIONS);

export function hasPermission(
  permissions: string[] | undefined,
  required: PermissionKey | PermissionKey[]
): boolean {
  if (!permissions) return false;
  if (permissions.includes("*")) return true;
  const list = Array.isArray(required) ? required : [required];
  return list.every((p) => permissions.includes(p));
}

export function roleDefaultPermissions(slug: string): string[] {
  switch (slug) {
    case "super-admin":
      return ["*"];
    case "admin":
      return ALL_PERMISSION_KEYS.filter((p) => p !== PERMISSIONS.MANAGE_STAFF);
    case "manager":
      return [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.ADD_PRODUCTS,
        PERMISSIONS.EDIT_PRODUCTS,
        PERMISSIONS.VIEW_INVENTORY,
        PERMISSIONS.MANAGE_INVENTORY,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.MANAGE_ORDERS,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.VIEW_INVOICES,
        PERMISSIONS.MANAGE_RETURNS,
        PERMISSIONS.MANAGE_COUPONS,
      ];
    case "cashier":
      return [
        PERMISSIONS.VIEW_PRODUCTS,
        PERMISSIONS.CREATE_BILLS,
        PERMISSIONS.VIEW_ORDERS,
        PERMISSIONS.VIEW_CUSTOMERS,
        PERMISSIONS.MANAGE_CUSTOMERS,
        PERMISSIONS.VIEW_INVOICES,
      ];
    case "staff":
      return [PERMISSIONS.VIEW_PRODUCTS, PERMISSIONS.VIEW_ORDERS];
    default:
      return [];
  }
}
