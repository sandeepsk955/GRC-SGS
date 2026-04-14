// src/services/CAPAReviewService.ts
import { api } from "./CAPAUpdateservice";

/** List row on the CAPA Review list (screenshot #1) */
export type ReviewAuditRow = {
  auditMasterId: number;
  auditStandard: string;
  compliancePeriodId: string;
  startDate: string;
  endDate?: string;
  auditee?: string;        // same as "auditorName" in some payloads
  auditStatus?: string;
  findings: number;
};

export type ReviewControlRow = {
  slNo: number;
  auditControlId: number;
  controlTitle: string;
  auditStartDate: string;
  auditee?: string;
  initialAuditStatus: string;
  initialAuditStatusId?: number;
  preCapaComments?: string;
  userCapaComments?: string;
  comments?: string;
  finalAuditStatus?: number | string | null;
};

const pick = <T = any>(obj: any, keys: string[], fallback?: T): T => {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return fallback as T;
};

const toReviewAuditRow = (r: any): ReviewAuditRow => ({
  auditMasterId: Number(pick(r, ["auditMasterId", "auditId", "id"], 0)),
  auditStandard: pick(r, ["auditStandard", "standard", "standardName"], ""),
  compliancePeriodId: pick(r, ["compliancePeriodId", "complianceId", "compliancePeriod"], ""),
  startDate: pick(r, ["startDate", "auditStartDate", "start_time"], ""),
  endDate: pick(r, ["endDate", "auditEndDate", "end_time"], ""),
  auditee: pick(r, ["auditee", "auditeeName", "auditorName", "auditor_user_name"], "-"),
  auditStatus: pick(r, ["auditStatus", "status"], "-"),
  findings: Number(pick(r, ["findings", "findingsCount", "totalFindings", "totalFinding"], 0)),
});

const toReviewControlRow = (r: any, idx: number): ReviewControlRow => ({
  slNo: Number(pick(r, ["slNo", "slno", "id"], idx + 1)),
  auditControlId: Number(pick(r, ["auditControlId", "controlId", "id"], 0)),
  controlTitle: pick(r, ["controlTitle", "title", "control"], ""),
  auditStartDate: pick(r, ["auditStartDate", "startDate", "date"], ""),
  auditee: pick(r, ["auditee", "auditeeName", "auditorName"], "-"),
  initialAuditStatus: pick(r, ["initialAuditStatus", "status", "initialStatus"], ""),
  initialAuditStatusId: pick(r, ["initialAuditStatusId", "statusId", "initialStatusId"], undefined),
  preCapaComments: pick(r, ["preCapaComments", "auditorComments", "initialAuditorComments"], undefined),
  userCapaComments: pick(r, ["userCapaComments", "capaComments", "auditeeComments"], undefined),
  comments: pick(r, ["comments", "finalComments", "finalAuditorComments"], undefined),
  finalAuditStatus: pick(r, ["finalAuditStatus"], null),
});

export const ReviewCloseEnum = { finalCapa: 8 }; // adjust if your backend expects a different enum id

/** GET list for CAPA Review */
export async function getCapaReview(customerId: number, userId: number): Promise<ReviewAuditRow[]> {
  const { data } = await api.get(`/Audit/GetAuditsReviewCAPA?customerId=${customerId}&UserId=${userId}`);
  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map(toReviewAuditRow);
}

/** GET controls for a selected audit */
export async function getReviewControls(customerId: number, auditMasterId: number): Promise<ReviewControlRow[]> {
  const { data } = await api.get(`/Audit/GetAuditRecords?CustomerId=${customerId}&AuditMasterId=${auditMasterId}`);
  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map(toReviewControlRow);
}

/** GET control info (for popup prefill) */
export async function getControlInfo(controlId: number, customerId: number) {
  const { data } = await api.get(`/Audit/GetControlInfo?controlId=${controlId}&CustomerId=${customerId}`);
  return data?.data ?? null;
}

/** PUT close CAPA Review */
export async function closeCapaReview(auditMasterId: number, customerId: number, enumId = ReviewCloseEnum.finalCapa) {
  const { data } = await api.put(
    `/Audit/Auditclose?auditMasterId=${auditMasterId}&CustomerId=${customerId}&EnumId=${enumId}`,
    null,
    { responseType: "text" as any }
  );
  return data; // usually plain text; surfaced in popup
}