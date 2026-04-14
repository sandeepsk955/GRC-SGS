// src/services/user.service.ts
import { apiService, unwrapData } from "../services/api.ts";

export type UserRow = {
  id: number;
  name: string;
  email: string;
  customerName?: string;
  phoneNo?: string | null;
  role: string[];
  roleId: number[];
  status: boolean;
  govId?: number;
  govName?: string;
};

function toArray<T>(node: unknown): T[] {
  if (!node) return [];
  return Array.isArray(node) ? node : [node as T];
}
function pickOneById<T extends Record<string, any>>(node: unknown, id: number, keys: string[]) {
  const arr = toArray<T>(node);
  return (
    arr.find((x) => keys.some((k) => Number(x?.[k]) === Number(id))) ??
    arr[0] ??
    null
  );
}

export async function getUsers(customerId: number): Promise<UserRow[]> {
  const data = await unwrapData<any>(apiService.get(`/UserMaster`, { params: { CustomerId: customerId } }));
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map((u: any) => ({
    id: Number(u.id),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    customerName: u.customerName ?? undefined,
    phoneNo: u.phoneNo ?? null,
    role: Array.isArray(u.role) ? u.role.map(String) : [],
    roleId: Array.isArray(u.roleId) ? u.roleId.map((n: any) => Number(n)) : [],
    status: !!u.status,
    govId: typeof u.govId === "number" ? u.govId : Number(u.govId ?? NaN),
    govName: u.govName ?? undefined,
  }));
}

export async function getUserById(customerId: number, userId: number): Promise<UserRow | null> {
  const res = await apiService.get(`/UserMaster`, { params: { Userid: userId, CustomerId: customerId } }).catch(() => null);
  const node = res ? await unwrapData<any>(Promise.resolve(res)) : null;
  if (!node) return null;

  const hit = pickOneById<any>(node, userId, ["id", "userId"]);
  if (!hit) return null;

  return {
    id: Number(hit.id ?? hit.userId),
    name: String(hit.name ?? ""),
    email: String(hit.email ?? ""),
    customerName: hit.customerName ?? undefined,
    phoneNo: hit.phoneNo ?? null,
    role: Array.isArray(hit.role) ? hit.role.map(String) : [],
    roleId: Array.isArray(hit.roleId) ? hit.roleId.map((n: any) => Number(n)) : [],
    status: !!hit.status,
    govId: Number(hit.govId ?? 0),
    govName: hit.govName ?? undefined,
  };
}

export async function createUser(customerId: number, payload: {
  name: string;
  email: string;
  status: "active" | "inactive";
  roleIds: number[];
  governanceId: number;
}) {
  const body = {
    name: payload.name,
    email: payload.email,
    customerId,
    cliRoleId: Array.isArray(payload.roleIds) ? payload.roleIds.map(Number) : [],
    status: payload.status === "active",
    createdBy: Number(sessionStorage.getItem("userId")) || 0,
    govId: Number(payload.governanceId),
  };
  return apiService.post(`/UserMaster`, body);
}

export async function updateUser(customerId: number, userId: number, payload: {
  name: string;
  email: string;
  status: "active" | "inactive";
  roleIds: number[];
  governanceId: number;
}) {
  const body = {
    name: payload.name,
    email: payload.email,
    customerId,
    cliRoleId: Array.isArray(payload.roleIds) ? payload.roleIds.map(Number) : [],
    status: payload.status === "active",
    createdBy: Number(sessionStorage.getItem("userId")) || 0,
    govId: Number(payload.governanceId),
  };
  return apiService.put(`/UserMaster`, body, { params: { Userid: userId, CustomerId: customerId } });
}



export async function deleteUser(customerId: number, userId: number) {
  return apiService.delete(`/UserMaster/${userId}`, {
    params: { CustomerId: customerId },
  });
}