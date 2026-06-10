import { createClient } from "@/lib/supabase/server";

export type PermissionItem = {
  id: string;
  resource: string;
  action: string;
};

export type RoleWithPermissions = {
  id: string;
  name: string;
  description: string | null;
  permission_count: number;
  permissions: PermissionItem[];
};

export async function getRoles(): Promise<RoleWithPermissions[]> {
  const supabase = await createClient();

  const [rolesResult, permissionsResult] = await Promise.all([
    supabase.from("roles").select("id, name, description").order("name"),
    supabase.from("permissions").select("id, role_id, resource, action").order("resource"),
  ]);

  if (rolesResult.error) {
    console.error("getRoles error:", rolesResult.error);
    return [];
  }

  const permissionsByRole = new Map<string, PermissionItem[]>();
  for (const p of permissionsResult.data ?? []) {
    const list = permissionsByRole.get(p.role_id) ?? [];
    list.push({ id: p.id, resource: p.resource, action: p.action });
    permissionsByRole.set(p.role_id, list);
  }

  return (rolesResult.data ?? []).map((role) => {
    const permissions = permissionsByRole.get(role.id) ?? [];
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permission_count: permissions.length,
      permissions,
    };
  });
}
