// src/services/role.service.ts
import { apiService, unwrapData } from "../services/api.ts"; // <- your api.ts

export type RoleType = { roleTypeId: number; roleTypeDescription: string };
export type RoleRow = {
  sysRoleId: number;
  roleFName: string;
  roleSName: string;
  roleDescription?: string;
  description?: string;
  roleTypeId: number;
  roleTypeDescription?: string;
  govName?: string;
  govId?: number;
  active: boolean;
};

/** Some backends return {data: [...]} or just [...]. This normalizes it. */
function toArray<T>(node: unknown): T[] {
  if (!node) return [];
  return Array.isArray(node) ? node : [node as T];
}

/** Pick one item by numeric id from an array-or-object response */
function pickOneById<T extends Record<string, any>>(node: unknown, id: number, keys: string[]) {
  const arr = toArray<T>(node);
  return (
    arr.find((x) => keys.some((k) => Number(x?.[k]) === Number(id))) ??
    arr[0] ??
    null
  );
}

export async function getRoleTypes(customerId: number): Promise<RoleType[]> {
  const data = await unwrapData<RoleType[]>(
    apiService.get(`/RoleMaster/roletypelookup`, { params: { CustomerId: customerId } })
  );
  return Array.isArray(data) ? data : [];
}

export async function getRoles(customerId: number): Promise<RoleRow[]> {
  const data = await unwrapData<any>(apiService.get(`/RoleMaster`, { params: { CustomerId: customerId } }));
  return Array.isArray(data) ? (data as RoleRow[]) : Array.isArray(data?.data) ? data.data : [];
}

export async function getRoleById(customerId: number, roleId: number): Promise<RoleRow | null> {
  // Try RoleId first (case-sensitive servers vary); fall back to Roleid
  const try1 = await apiService.get(`/RoleMaster`, { params: { RoleId: roleId, CustomerId: customerId } }).catch(() => null);
  const payload1 = try1 ? await unwrapData<any>(Promise.resolve(try1)) : null;

  let node = payload1;
  if (!node) {
    const try2 = await apiService.get(`/RoleMaster`, { params: { Roleid: roleId, CustomerId: customerId } }).catch(() => null);
    node = try2 ? await unwrapData<any>(Promise.resolve(try2)) : null;
  }

  // Server might return a list; filter by id
  const hit = pickOneById<RoleRow>(node, roleId, ["sysRoleId", "roleId", "id"]);
  if (!hit) return null;

  // Normalize
  return {
    sysRoleId: Number((hit as any).sysRoleId ?? (hit as any).roleId ?? (hit as any).id),
    roleFName: String((hit as any).roleFName ?? ""),
    roleSName: String((hit as any).roleSName ?? ""),
    roleDescription: (hit as any).roleDescription ?? (hit as any).description ?? "",
    description: (hit as any).description ?? (hit as any).roleDescription ?? "",
    roleTypeId: Number((hit as any).roleTypeId ?? 0),
    roleTypeDescription: (hit as any).roleTypeDescription,
    govId: Number((hit as any).govId ?? (hit as any).governanceId ?? 0),
    govName: (hit as any).govName,
    active: !!(hit as any).active,
  };
}

export async function createRole(customerId: number, payload: {
  roleName: string;
  roleShortName: string;
  description: string;
  status: "active" | "inactive";
  roleTypeId: number;
  governanceId: number;
}) {
  const body = {
    customerId,
    roleFName: payload.roleName,
    roleSName: payload.roleShortName,
    roleDescription: payload.description || "",
    active: payload.status === "active",
    roleTypeId: Number(payload.roleTypeId),
    govId: Number(payload.governanceId),
  };
  return apiService.post(`/RoleMaster`, body);
}

export async function updateRole(customerId: number, roleId: number, payload: {
  roleName: string;
  roleShortName: string;
  description: string;
  status: "active" | "inactive";
  roleTypeId: number;
  governanceId: number;
}) {
  const body = {
    customerId,
    roleFName: payload.roleName,
    roleSName: payload.roleShortName,
    roleDescription: payload.description || "",
    active: payload.status === "active",
    roleTypeId: Number(payload.roleTypeId),
    govId: Number(payload.governanceId),
  };

  // Try RoleId, then Roleid
  try {
    return await apiService.put(`/RoleMaster`, body, { params: { RoleId: roleId, CustomerId: customerId } });
  } catch {
    return apiService.put(`/RoleMaster`, body, { params: { Roleid: roleId, CustomerId: customerId } });
  }
}
