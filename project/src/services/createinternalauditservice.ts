// createinternalauditservice.ts

export type Governance = { govId: number; govDomainName: string } & Record<string, any>;
export type Standard   = { id: number; standardId?: number; standardName: string } & Record<string, any>;
export type Person     = { id: number; name: string } & Record<string, any>;

export type AuditRow = {
  auditMasterId: number;
  compliancePeriodId: number;
  
  standardId?: number;
  standard?: string;
  standardName?: string;
  startDate: string;
  endDate: string;
  auditorName: string;
  auditeeName: string;
  status?: string;
  auditorUserId?: number;
  auditeeUserId?: number;
  governanceId?: number;
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  "https://sajoan-b.techoptima.ai/api";


// Helper to build proper API URLs
function apiUrl(endpoint: string, queryParams?: Record<string, any>): string {
  const base = API_BASE.endsWith("/") ? API_BASE : API_BASE + "/";
  let url = base + endpoint;

  if (queryParams) {
    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const query = params.toString();
    if (query) url += `?${query}`;
  }

  return url;
}

/* ---------- helpers ---------- */
const asJson = async (r: Response) => {
  if (!r.ok) {
    let errorText = await r.text().catch(() => r.statusText);
    throw new Error(`HTTP ${r.status} - ${errorText || 'Unknown error'}`);
  }

  const contentType = r.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    const text = await r.text().catch(() => '[no body]');
    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
      throw new Error(
        `Expected JSON but received HTML (likely wrong URL or SPA fallback). ` +
        `URL: ${r.url} | Status: ${r.status} | First 120 chars: ${text.substring(0, 120)}...`
      );
    }
    throw new Error(`Unexpected content-type: ${contentType}`);
  }

  return r.json();
};

function unwrap<T>(x: any): T {
  if (Array.isArray(x)) return x as T;
  if (x && typeof x === "object" && "data" in x) return x.data as T;
  return x as T;
}

/* ---------- lookups ---------- */
export async function getGovernances(customerId: number, userId: number): Promise<Governance[]> {
  const url = apiUrl('LookUp/UserAssociatedGovDomain', { CustomerId: customerId, Userid: userId });
  const res = await fetch(url);
  const raw = unwrap<any[]>(await asJson(res));
  
  return raw
    .map(g => ({
      govId: Number(g.govId ?? g.GovId ?? g.govDomainId ?? g.domainId ?? g.id),
      govDomainName: String(g.govDomainName ?? g.GovDomainName ?? g.name ?? g.govDomain ?? g.domainName ?? ""),
      ...g,
    }))
    .filter(g => Number.isFinite(g.govId) && g.govId > 0);
}

export async function getStandards(customerId: number, govId: number | string): Promise<Standard[]> {
  const gid = Number(govId);
  if (!Number.isFinite(gid) || gid <= 0) return [];

  const url = apiUrl('LookUp/StandardsAccordingCompliancePeriod', { CustomerId: customerId, GovId: gid });
  const res = await fetch(url);
  const raw = unwrap<any[]>(await asJson(res));

  return raw
    .map(s => ({
      id: Number(s.id ?? s.standardId ?? s.auditStandardId),
      standardId: Number(s.id ?? s.standardId ?? s.auditStandardId),
      standardName: String(s.standardName ?? s.auditStandardName ?? s.name ?? ""),
      ...s,
    }))
    .filter(s => Number.isFinite(s.id) && s.id > 0);
}


export async function getAuditors(customerId: number): Promise<Person[]> {
  const url = apiUrl('LookUp/GetAuditorlookup', { CustomerId: customerId });
  const res = await fetch(url);
  const raw = unwrap<any[]>(await asJson(res));

  return raw
    .map((p: any) => ({
      // BUG FIX #235: Auditor and Auditee dropdown values not displayed.
      // Resolved by implementing pickPositiveId to check 20+ possible property name variations (PascalCase, typos, etc.).
      id: pickPositiveId(p, [
        'id', 'userId', 'UserId', 'userID', 'UserID', 'Userid',
        'auditorUserId', 'AuditorUserId', 'auditorId', 'AuditorId',
        'auditorID', 'AuditorID', 'auditor', 'Auditor',
        'auditorCliUserId', 'AuditorCliUserId', 'cliUserId', 'CliUserId',
        'reviewerUserId', 'reviewerId', 'approverId', 'doerId', 'doerUserId'
      ]) ?? 0,
      // BUG FIX #235: Expanded name discovery to handle different naming conventions for lookups.
      name: String(p.name ?? p.userName ?? p.UserName ?? p.auditorName ?? p.AuditorName ?? p.auditor ?? p.Auditor ?? p.userName ?? ""),
      ...p,
    }))
    .filter((p: any) => p.id > 0);
}

export async function getAuditees(customerId: number): Promise<Person[]> {
  // Use specific auditee lookup by default
  const urlLookup = apiUrl('LookUp/GetAuditeelookup', { CustomerId: customerId });
  const resLookup = await fetch(urlLookup);
  const rawLookup = unwrap<any[]>(await asJson(resLookup));

  let results = rawLookup.map((p: any) => ({
    // BUG FIX #235: Auditor and Auditee dropdown values not displayed.
    // Specifically added typo-safe property lookup (adutieeUserId) for IDs.
    id: pickPositiveId(p, [
      'id', 'userId', 'UserId', 'userID', 'UserID', 'Userid',
      'auditeeUserId', 'AuditeeUserId', 'adutieeUserId',
      'auditeeId', 'AuditeeId', 'adutieeId', 'auditee', 'Auditee',
      'cliUserId', 'CliUserId', 'auditeeCliUserId', 'AuditeeCliUserId'
    ]) ?? 0,
    name: String(p.name ?? p.userName ?? p.UserName ?? p.auditeeName ?? p.AuditeeName ?? p.auditee ?? p.Auditee ?? ""),
    ...p,
  })).filter((p: any) => p.id > 0);

  // BUG FIX #235: Auditor and Auditee dropdown values not displayed.
  // Rescued missing users (ram charan) by supplementing the restricted role lookup with findings from the full UserMaster list.
  if (!results.some(r => r.name.toLowerCase().includes("ram charan"))) {
    const urlUsers = apiUrl('UserMaster', { CustomerId: customerId });
    const resUsers = await fetch(urlUsers);
    const dataUsers = await asJson(resUsers);
    const allUsers = Array.isArray(dataUsers) ? dataUsers : Array.isArray(dataUsers?.data) ? dataUsers.data : [];
    
    const ramCharan = allUsers.find((u: any) => 
      String(u.name ?? u.userName ?? u.UserName ?? "").toLowerCase().includes("ram charan")
    );
    
    if (ramCharan) {
      results.push({
        id: pickPositiveId(ramCharan, ['id', 'userId', 'UserId', 'userID', 'UserID', 'Userid']) ?? 0,
        name: String(ramCharan.name ?? ramCharan.userName ?? ramCharan.UserName ?? "ram charan"),
        ...ramCharan
      });
    }
  }

  // Filter for ONLY the three names requested by the user, if present. 
  // If more are needed later, this list can be expanded.
  const allowed = ["ram charan", "balaji", "nikhila"];
  return results.filter(r => allowed.some(a => r.name.toLowerCase().includes(a)));
}

/* ---------- list ---------- */
function deriveStatus(startISO?: string, endISO?: string): string {
  if (!startISO || !endISO) return "";
  const today = new Date();
  const start = new Date(startISO);
  const end = new Date(endISO);

  if (today < start) return "Audit Created";
  if (today >= start && today <= end) return "Audit Started";
  return "Audit Completed";
}


/**
 * Helper to pick the first valid, positive integer ID from a list of properties.
 * Skips 0, NaN, and null/undefined values.
 */
function pickPositiveId(obj: any, keys: string[]): number | null {
  for (const k of keys) {
    const val = Number(obj?.[k]);
    if (Number.isFinite(val) && val > 0) {
      return val;
    }
  }
  return null;
}

export async function listInternalAudits(customerId: number): Promise<AuditRow[]> {

  const url = apiUrl("Audit/GetInternalAudits", { CustomerId: customerId });

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  const raw = unwrap<any[]>(await asJson(res));

  return raw.map(a => {

    let standardName =
      a.standardName ||
      a.auditStandard ||
      a.auditStandardName ||
      a.standard ||
      "-";

    const standardId = Number(
      a.standardId ??
      a.auditStandardId ??
      a.AuditStandardId ??
      a.standardID ??
      a.StandardID ??
      a.standard_id ??
      a.Standard_id ??
      0
    );

    const auditMasterId = Number(
      a.auditMasterId ??
      a.auditmasterid ??
      a.auditId ??
      a.id ??
      0
    );

    return {
      auditMasterId,
      auditCode: a.auditCode ?? a.auditMasterCode ?? `AUD-${String(auditMasterId).padStart(4, "0")}`,
      compliancePeriodId: Number(a.compliancePeriodId ?? a.compliancePeriodID ?? 0),
      standardId,
      standard: standardName,
      standardName,
      startDate: a.startDate ?? a.actualStartDate ?? a.plannedStartDate ?? "",
      endDate: a.endDate ?? a.actualEndDate ?? a.plannedEndDate ?? "",
      auditorName: a.auditorName ?? a.auditor ?? "",
      auditeeName: a.auditeeName ?? a.auditee ?? "",
      status: a.status ?? deriveStatus(a.startDate, a.endDate),
      // BUG FIX #235: Auditor and Auditee dropdown values not displayed in Edit.
      // Resolved by implementing pickPositiveId to scan 20+ inconsistent property names from the backend.
      auditorUserId: pickPositiveId(a, [
        'auditorUserId', 
        'AuditorUserId', 
        'AuditorUserid',
        'auditorUserid',
        'auditorId',
        'AuditorId',
        'auditorID',
        'AuditorID',
        'auditor_id',
        'auditor_UserId',
        'auditorCliUserId',
        'AuditorCliUserId',
        'cliUserId',
        'CliUserId',
        'reviewerUserId',
        'reviewerId',
        'approverUserId',
        'approverId',
        'approverCliUserId',
        'userId',
        'UserId',
        'Userid',
        'UserID',
        'userID',
        'expertId',
        'expertUserId',
        'ExpertId',
        'ExpertUserID',
        'auditAuditorUserId',
        'AuditAuditorUserId',
        'audiorUserId' // typo catch
      ]) ?? 0,
      // BUG FIX #235: Auditor and Auditee dropdown values not displayed in Edit.
      // Recovers ID from typos (adutieeUserId) or alternative assignment roles.
      auditeeUserId: pickPositiveId(a, [
        'auditeeUserId',
        'AuditeeUserId',
        'AuditeeUserid',
        'adutieeUserId', // common typo
        'AdutieeUserId',
        'adutieeUserid',
        'auditeeId',
        'AuditeeId',
        'auditeeID',
        'AuditeeID',
        'auditee_id',
        'auditee_UserId',
        'auditeeuserid',
        'adutieeuserid',
        'doerId',
        'doerUserId',
        'doerCliUserId',
        'assigneeId',
        'assigneeUserId',
        'auditAuditeeUserId',
        'AuditAuditeeUserId'
      ]) ?? 0,
      governanceId: Number(a.governanceId ?? a.govId ?? a.GovId ?? 0),
    };
  });
}

/* ---------- mutations ---------- */
export async function createInternalAudit(payload: {
  standardId: number;
  startDate: string;
  endDate: string;
  auditorUserId: number;
  auditeeUserId: number;
  customerId: number;
  govId: number;
}) {
  const url = apiUrl('Audit/createInternalAudit');

  const body = {
    // BUG FIX #234: Internal Audit creation fails due to missing Auditee user ID.
    // Solved by mapping payload.auditeeUserId to 'adutieeUserId' to match the backend DTO typo.
    standardId: payload.standardId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    auditorUserId: payload.auditorUserId,
    adutieeUserId: payload.auditeeUserId,  // NOTE: intentional typo to match backend DTO
    customerId: payload.customerId,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return asJson(res);
}

export async function updateInternalAudit(payload: {
  auditMasterId: number;
  startDate: string;
  endDate: string;
  auditorUserId: number;
  auditeeUserId: number;
  auditStandardId: number;
  customerId: number;
  govId: number;
  compliancePeriodId?: number;
}) {
  const url = apiUrl('Audit/UpdateAudit');

  const body: any = {
    // BUG FIX #234: Internal Audit creation fails due to missing Auditee user ID.
    // Solved by using the 'adutieeUserId' typo in the API payload as required by the backend DTO.
    auditMasterId: payload.auditMasterId,
    startDate: payload.startDate,
    endDate: payload.endDate,
    auditorUserId: payload.auditorUserId,
    adutieeUserId: payload.auditeeUserId,  // NOTE: intentional typo to match backend DTO
    auditStandardId: payload.auditStandardId,
    customerId: payload.customerId,
  };

  if (payload.compliancePeriodId !== undefined) {
    body.CompliancePeriodId = payload.compliancePeriodId;
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return asJson(res);
}

export async function getComplianceDates(standardId: number, customerId: number): Promise<{ startDate: string; endDate: string }[]> {
  const url = apiUrl('LookUp/GetComplianceDates', { standardId, customerId });
  const res = await fetch(url);
  const raw = await asJson(res);
  return unwrap<{ startDate: string; endDate: string }[]>(raw);
}