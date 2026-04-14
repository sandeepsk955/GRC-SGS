// src/services/activityService.ts
import api, { unwrapData } from "./api";

export type Status = "completed" | "in-progress" | "pending" | "overdue" | string;
export type Priority = "high" | "medium" | "low" | string;

export interface ActivityItem {
  id: string;

  // UI props
  activityTitle: string;
  activityDescr: string;
  status: Status;
  priority: Priority;
  assignee: string;
  dueDate: string;
  progress: number;
  category: string;

  // server props we keep
  doerRole?: string;
  doerRoleId?: number;
  approverRole?: string;
  approverRoleId?: number;
  frequency?: string;
  frequencyId?: number;
  duration?: number;
  active?: boolean;
  auditable?: boolean;
  isApplicable?: boolean;
  justification?: string;
  standardId?: number;
}

export interface LookupOption {
  id: number;
  name: string;
}

/* ---------- helpers ---------- */
const asArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  const firstArr =
    raw && typeof raw === "object"
      ? (Object.values(raw).find((v) => Array.isArray(v)) as any[] | undefined)
      : undefined;
  return Array.isArray(firstArr) ? firstArr : [];
};
const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : 0);

const haveIds = (customerId?: number | string, govId?: number | string) =>
  !(customerId == null || customerId === "" || govId == null || govId === "");

/* ---------- API ---------- */
export const ActivityAPI = {
  // LIST
  async list(customerId?: number | string, govId?: number | string): Promise<ActivityItem[]> {
    if (!haveIds(customerId, govId)) return [];
    const raw = await unwrapData<any>(
      api.get("/ActivityMaster", { params: { CustomerId: customerId, GovId: govId } })
    );
    return asArray(raw).map((r: any) => ({
      id: String(r?.id ?? r?.activityId ?? ""),
      activityTitle: r?.activityTitle ?? r?.activityName ?? "-",
      activityDescr: r?.activityDetails ?? r?.activityDescr ?? "",
      status: "pending",
      priority: "medium",
      assignee: r?.doerRole ?? "",
      dueDate: "",
      progress: Number(r?.progress ?? 0),
      category: r?.frequency ?? "",

      doerRole: r?.doerRole,
      doerRoleId: num(r?.doerRoleId),
      approverRole: r?.approverRole,
      approverRoleId: num(r?.approverRoleId),
      frequency: r?.frequency,
      frequencyId: num(r?.frequencyId),
      duration: num(r?.duration),
      active: Boolean(r?.active ?? r?.isActive ?? true),
      auditable: Boolean(r?.auditable ?? true),
      isApplicable: r?.isApplicable ?? true,
      justification: r?.justification ?? "",
      standardId: num(r?.standardId ?? 1),
    }));
  },

  // LOOKUPS
  /** Doer roles come as [{ doerRoleId, doerRole }, ...] per your screenshot */
  async doerRoles(customerId?: number | string, govId?: number | string): Promise<LookupOption[]> {
    if (!haveIds(customerId, govId)) return [];
    const raw = await unwrapData<any>(
      api.get("/LookUp/DoerRolelookup", { params: { CustomerId: customerId, GovId: govId } })
    );
    return asArray(raw)
      .map((r) => ({
        id: num(r?.doerRoleId ?? r?.roleId ?? r?.id),
        name: String(r?.doerRole ?? r?.roleName ?? r?.name ?? "").trim(),
      }))
      .filter((o) => o.id > 0 && o.name.length > 0);
  },

  /** Approver roles usually as [{ approverRoleId, approverRole }, ...] */
  async approverRoles(
    customerId?: number | string,
    govId?: number | string
  ): Promise<LookupOption[]> {
    if (!haveIds(customerId, govId)) return [];
    const raw = await unwrapData<any>(
      api.get("/LookUp/ApproverRolelookup", {
        params: { CustomerId: customerId, GovId: govId },
      })
    );
    return asArray(raw)
      .map((r) => ({
        id: num(r?.approverRoleId ?? r?.roleId ?? r?.id),
        name: String(r?.approverRole ?? r?.roleName ?? r?.name ?? "").trim(),
      }))
      .filter((o) => o.id > 0 && o.name.length > 0);
  },

  /** Frequencies e.g. [{ frequencyId, frequency }, ...] */
  async frequencies(customerId?: number | string, govId?: number | string): Promise<LookupOption[]> {
    if (!haveIds(customerId, govId)) return [];
    const raw = await unwrapData<any>(
      api.get("/LookUp/FrequencyLookUp", { params: { CustomerId: customerId, GovId: govId } })
    );
    return asArray(raw)
      .map((r) => ({
        id: num(r?.frequencyId ?? r?.id ?? r?.value),
        name: String(r?.frequency ?? r?.name ?? r?.text ?? "").trim(),
      }))
      .filter((o) => o.id > 0 && o.name.length > 0);
  },

  // UPDATE (ActivityId in querystring, numeric *_Id fields in body)
  update(activityId: string | number, payload: any) {
    return unwrapData(api.put("/ActivityMaster", payload, { params: { ActivityId: activityId } }));
  },

  remove(id: string) {
    return unwrapData(api.delete(`/ActivityMaster/${encodeURIComponent(id)}`));
  },
};
