// src/services/manageinternalauditservice.ts

export type AuditRow = {
  auditMasterId: number;
  auditCode?: string;               // friendly code if backend provides it
  auditStandard: string;
  compliancePeriodId: string | number;
  startdate?: string;               // normalized ISO string or ''
  enddate?: string;                 // normalized ISO string or ''
  auditeename?: string;             // normalized
  auditStatus: string;
};

export enum CloseAuditEnum {
  initialAuditclose = 1,
}

type ApiResponse<T> = {
  statusCode?: number;
  message?: string;
  data?: T;
  errors?: unknown;
};

const API_BASE = import.meta.env.DEV ? "/api" : "https://sajoan-b.techoptima.ai/api";

const normDate = (v?: any) => {
  if (!v) return "";
  const s = String(v);
  // common “empty” values from .NET backends
  if (s.startsWith("0001-01-01") || s === "1900-01-01" || s === "01/01/0001") return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

// Normalizer to handle field-name drift from backend
const mapOne = (it: any): AuditRow => {
  const id =
    Number(it?.auditMasterId ?? it?.auditmasterid ?? it?.auditId ?? it?.id ?? 0);

  const code =
    it?.auditCode ??
    it?.auditMasterCode ??
    it?.audit_no ??
    (id ? `AUD-${String(id).padStart(4, "0")}` : undefined);

  return {
    auditMasterId: id,
    auditCode: code,
    auditStandard: String(
      it?.auditStandard ?? it?.standardName ?? it?.standard ?? ""
    ),
    compliancePeriodId:
      it?.compliancePeriodId ?? it?.compliancePeriod ?? it?.cpId ?? "",
    startdate: normDate(
      it?.startdate ??
        it?.startDate ??
        it?.actualStartDate ??
        it?.plannedStartDate
    ),
    enddate: normDate(
      it?.enddate ?? it?.endDate ?? it?.actualEndDate ?? it?.plannedEndDate
    ),
    auditeename: String(it?.auditeename ?? it?.auditeeName ?? it?.auditee ?? ""),
    auditStatus: String(it?.auditStatus ?? it?.status ?? ""),
  };
};

export async function getAuditsForAuditor(
  customerId: number,
  userId: number
): Promise<AuditRow[]> {
  const url = `${API_BASE}/Audit/GetAuditsForAuditor?customerId=${customerId}&UserId=${userId}`;
  const res = await fetch(url, { headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as ApiResponse<any[]>;
  const arr = Array.isArray(json?.data) ? json!.data! : [];
  return arr.map(mapOne);
}

export async function startAudit(customerId: number, auditMasterId: number) {
  const url = `${API_BASE}/Audit/StartAudit?customerId=${customerId}&AuditMasterId=${auditMasterId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiResponse<any>;
}

export async function closeAudit(
  customerId: number,
  auditMasterId: number,
  enumId: CloseAuditEnum
) {
  const url = `${API_BASE}/Audit/Auditclose?customerId=${customerId}&EnumId=${enumId}&AuditMasterId=${auditMasterId}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as ApiResponse<any>;
}
