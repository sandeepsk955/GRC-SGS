// src/services/Assignements.ts

/* ---------- Types used by the UI ---------- */
export type AssignmentCard = {
  id: number;
  activityMasterId: number;
  compliancePeriodId: number | string;
  standardName: string;
  activityName: string;
  doerId?: number;
  approverId?: number;
  doer?: string;
  approver?: string;
  startDate?: string;
  endDate?: string;
};

const API_BASE = import.meta.env.DEV ? "/api" : "https://sajoan-b.techoptima.ai/api";


const asJson = async (r: Response) => {
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`HTTP ${r.status} – ${t || r.statusText}`);
  }
  return r.json();
};

/* ============================================================
   VIEW/EDIT ASSIGNMENTS (cards list)
   Mirrors your old Angular getAssignment / getAssignmentForAdmin
   ============================================================ */

export async function getAssignmentsForAdmin(customerId: number) {
  // Swagger shows uppercase query keys (CustomerId)
  const url = `${API_BASE}/AssignmentMaster?CustomerId=${customerId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

export async function getAssignments(customerId: number, userId: number, enumId = 0) {
  const url = `${API_BASE}/AssignmentMaster/GetAllUserAssigments?CustomerId=${customerId}&EnumId=${enumId}&UserId=${userId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

export function flattenAssignments(data: any[]): AssignmentCard[] {
  if (!Array.isArray(data)) return [];
  return data.flatMap((period: any) =>
    (period.standards ?? []).flatMap((std: any) =>
      (std.activities ?? []).map((a: any) => ({
        id: Number(a.id),
        activityMasterId: Number(a.activityMasterId),
        compliancePeriodId: period.compliancePeriodId,
        standardName: String(std.standardName ?? ""),
        activityName: String(a.activityName ?? ""),
        doerId: a.doerId ? Number(a.doerId) : undefined,
        approverId: a.approverId ? Number(a.approverId) : undefined,
        doer: a.doer ?? "",
        approver: a.approver ?? "",
        startDate: a.startDate ?? "",
        endDate: a.endDate ?? "",
      }))
    )
  );
}

/* ============================================================
   LOOKUPS (ported from your Angular service)
   - Activity lookup (needs CustomerId & govId)
   - Doers by activity
   - Approvers by activity
   - Compliance period lookup
   Endpoints based on your old code:
     /LookUp/Activitylookup?CustomerId=&govId=
     /LookUp/DoerslookupbyActivity?CustomerId=&activityId=
     /LookUp/ApproverslookupByActivity?CustomerId=&activityId=
     /LookUp/ComplianceLookup?CustomerId=
   ============================================================ */

export async function activityLookup(customerId: number, govId: number) {
  const url = `${API_BASE}/LookUp/Activitylookup?CustomerId=${customerId}&govId=${govId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

export async function doersLookup(customerId: number, activityId: number) {
  const url = `${API_BASE}/LookUp/DoerslookupbyActivity?CustomerId=${customerId}&activityId=${activityId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

export async function approversLookup(customerId: number, activityId: number) {
  const url = `${API_BASE}/LookUp/ApproverslookupByActivity?CustomerId=${customerId}&activityId=${activityId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

export async function complianceLookup(customerId: number) {
  const url = `${API_BASE}/LookUp/ComplianceLookup?CustomerId=${customerId}`;
  return asJson(await fetch(url, { headers: { accept: "application/json" } }));
}

/* ============================================================
   CREATE / UPDATE ASSIGNMENT (ported from Angular)
   Endpoints based on your old code:
     POST /AssignmentMaster
     PUT  /AssignmentMaster?Assignmentid={id}
   Body should include:
     compliancePeriodId, activityMasterId, doerCliUserId, approverCliUserId,
     startDate (yyyy-MM-dd), endDate (yyyy-MM-dd), customerId
   ============================================================ */

export type UpsertAssignmentBody = {
  compliancePeriodId: number | string;
  activityMasterId: number | string;
  doerCliUserId: number | string;
  approverCliUserId: number | string;
  startDate: string; // 'yyyy-MM-dd'
  endDate: string;   // 'yyyy-MM-dd'
  customerId: number | string;
};

export async function addAssignment(body: UpsertAssignmentBody) {
  const url = `${API_BASE}/AssignmentMaster`;
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  return asJson(r);
}

export async function updateAssignment(id: number | string, body: UpsertAssignmentBody) {
  const url = `${API_BASE}/AssignmentMaster?Assignmentid=${id}`;
  const r = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  return asJson(r);
}
