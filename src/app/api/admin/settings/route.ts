import { getSettings, setSettings, type StoreSettings } from "@/lib/settings";
import { requireStaffApi } from "@/lib/admin-auth";
import { jsonOk } from "@/lib/api-response";
import { PERMISSIONS } from "@/lib/permissions";

export async function GET() {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_SETTINGS);
  if (error) {
    const view = await requireStaffApi(PERMISSIONS.VIEW_REPORTS);
    if (view.error) return view.error;
  }

  const settings = await getSettings();
  return jsonOk(settings);
}

export async function PUT(req: Request) {
  const { error } = await requireStaffApi(PERMISSIONS.MANAGE_SETTINGS);
  if (error) return error;

  const body = (await req.json()) as Partial<StoreSettings>;
  await setSettings(body);
  const settings = await getSettings();
  return jsonOk(settings);
}
