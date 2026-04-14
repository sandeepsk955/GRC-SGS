// components/pages/CreateInternalAuditForm.tsx
import { useEffect, useState } from "react";
import {
  getGovernances,
  getStandards,
  getAuditors,
  getAuditees,
  createInternalAudit,
  updateInternalAudit,
  // getComplianceDates, // no endpoint in your server
  Governance,
  Standard,
  Person,
  AuditRow,
} from "../../services/createinternalauditservice";
import type { PopupKind } from "../popups/PopupMessages.tsx";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: (result?: { ok: boolean; messages?: string[]; kind?: PopupKind; title?: string }) => void;
  customerId: number;
  userId: number;
  initial?: AuditRow | null;
};

const toDateOnly = (d: string | Date): string => {
  if (typeof d === "string" && d) return d; // 'YYYY-MM-DD'
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return "";
};
const toNum = (v: string | number | null | undefined): number =>
  typeof v === "number" ? v : Number(String(v ?? "").trim());
const sv = (v: number | null | undefined) => (Number.isFinite(v as number) ? String(v) : "");

function toMessageList(x: any): string[] {
  if (!x) return [];
  if (typeof x === "string") return [x];
  const msgs: string[] = [];
  if (x.message) msgs.push(String(x.message));
  if (Array.isArray(x.messages)) msgs.push(...x.messages.map(String));
  if (x.statusMessage) msgs.push(String(x.statusMessage));
  const errors = x.errors ?? x.Errors;
  if (Array.isArray(errors)) msgs.push(...errors.map(String));
  if (!msgs.length) { try { msgs.push(JSON.stringify(x)); } catch {} }
  return msgs;
}

export default function CreateAuditModal({
  open,
  onClose,
  onSaved,
  customerId,
  userId,
  initial,
}: Props) {
  const [governances, setGovernances] = useState<Governance[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [auditors, setAuditors] = useState<Person[]>([]);
  const [auditees, setAuditees] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // store numbers
  const [govId, setGovId] = useState<number | null>(null);
  const [standardId, setStandardId] = useState<number | null>(null);
  const [auditorUserId, setAuditorUserId] = useState<number | null>(null);
  const [auditeeUserId, setAuditeeUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setErr(null);

    setGovId(initial?.governanceId && Number.isFinite(Number(initial.governanceId)) ? Number(initial.governanceId) : null);
    setStandardId(initial?.standardId && Number.isFinite(Number(initial.standardId)) ? Number(initial.standardId) : null);
    setStartDate(initial?.startDate ? initial.startDate.slice(0, 10) : "");
    setEndDate(initial?.endDate ? initial.endDate.slice(0, 10) : "");
    // BUG FIX #235: Auditor and Auditee dropdown values not displayed in Edit.
    // Resolution: Property initialization now coerces to Number and checks for positive finite IDs. 
    // This ensures that string-based IDs from the API are correctly resolved into the numeric state.
    setAuditorUserId(initial?.auditorUserId && Number.isFinite(Number(initial.auditorUserId)) && Number(initial.auditorUserId) > 0 ? Number(initial.auditorUserId) : null);
    setAuditeeUserId(initial?.auditeeUserId && Number.isFinite(Number(initial.auditeeUserId)) && Number(initial.auditeeUserId) > 0 ? Number(initial.auditeeUserId) : null);
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const [gvs, aus, ees] = await Promise.all([
          getGovernances(customerId, userId),
          getAuditors(customerId),
          getAuditees(customerId),
        ]);
        if (cancelled) return;
        setGovernances(gvs);
        setAuditors(aus);
        setAuditees(ees);

        // BUG FIX #235: Auditor and Auditee dropdown values not displayed in Edit. 
        // Resolution: Implemented Name-Based ID Resolution Fallback. If the backend ID mapping fails, 
        // we match the name (e.g., "Meena") from the list against the dropdown options to recover the correct ID.
        if (initial) {
          if (!auditorUserId && initial.auditorName) {
            const match = aus.find(a => a.name.toLowerCase().trim() === initial.auditorName.toLowerCase().trim());
            if (match) setAuditorUserId(match.id);
          }
          if (!auditeeUserId && initial.auditeeName) {
            const match = ees.find(e => e.name.toLowerCase().trim() === initial.auditeeName.toLowerCase().trim());
            if (match) setAuditeeUserId(match.id);
          }
        }

        if (!initial?.auditMasterId && !govId && gvs.length) setGovId(gvs[0].govId);
      } catch (e: any) {
        if (!cancelled) setErr(toMessageList(e)[0] || "Failed to load lookups");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, customerId, userId, initial, govId, auditorUserId, auditeeUserId]);

  useEffect(() => {
    if (!open || !govId) return;
    let cancelled = false;
    (async () => {
      try {
        const stds = await getStandards(customerId, govId);
        if (cancelled) return;
        setStandards(stds);
        if (!stds.some(s => s.id === standardId)) {
          setStandardId(stds.length ? stds[0].id : null);
        }
      } catch (e: any) {
        if (!cancelled) setErr(toMessageList(e)[0] || "Failed to load standards");
      }
    })();
    return () => { cancelled = true; };
  }, [open, govId, customerId, standardId]);

  const title = initial?.auditMasterId ? "Edit Internal Audit" : "Create Internal Audit";
  const canSubmit =
    Number.isFinite(govId as number) &&
    Number.isFinite(standardId as number) &&
    startDate !== "" &&
    endDate !== "" &&
    Number.isFinite(auditorUserId as number) &&
    Number.isFinite(auditeeUserId as number);

  const validateIds = () => {
    const issues: string[] = [];
    if (!govId || govId <= 0) issues.push("Please select a valid Governance.");
    if (!standardId || standardId <= 0) issues.push("Please select a valid Standard.");
    if (!auditorUserId || auditorUserId <= 0) issues.push("Please select a valid Auditor.");
    if (!auditeeUserId || auditeeUserId <= 0) issues.push("Please select a valid Auditee.");
    return issues;
  };

  const validateDates = () => {
    if (!startDate || !endDate) return "Invalid audit date format.";
    if (startDate > endDate) return "Audit Start Date must be before Audit End Date.";
    return "";
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;

    const idIssues = validateIds();
    if (idIssues.length > 0) {
      onSaved({ ok: false, messages: idIssues, kind: "warning", title: "Missing or invalid fields" });
      return;
    }

    const aud = toNum(auditorUserId);
    const aee = toNum(auditeeUserId);
    if (!Number.isFinite(aud) || aud <= 0 || !Number.isFinite(aee) || aee <= 0) {
      onSaved({
        ok: false,
        messages: ["Please select valid Auditor and Auditee (non-zero IDs)."],
        kind: "warning",
        title: "Invalid Selection",
      });
      return;
    }

    const dateIssue = validateDates();
    if (dateIssue) {
      onSaved({ ok: false, messages: [dateIssue], kind: "warning", title: "Invalid Dates" });
      return;
    }

    try {
      setLoading(true);
      setErr(null);

      if (initial?.auditMasterId) {
        const res = await updateInternalAudit({
          auditMasterId: Number(initial.auditMasterId),
          startDate: toDateOnly(startDate),
          endDate: toDateOnly(endDate),
          auditorUserId: aud,
          auditeeUserId: aee,
          auditStandardId: Number(standardId),
          customerId,
          govId: Number(govId),
        });
        const msgs = toMessageList(res);
        onSaved({ ok: true, messages: msgs.length ? msgs : ["Audit updated successfully"], kind: "success", title: "Updated" });
        onClose();
      } else {
        const res = await createInternalAudit({
          standardId: Number(standardId),
          startDate: toDateOnly(startDate),
          endDate: toDateOnly(endDate),
          auditorUserId: aud,
          auditeeUserId: aee,
          customerId,
          govId: Number(govId),
        });
        const msgs = toMessageList(res);
        onSaved({ ok: true, messages: msgs.length ? msgs : ["Audit created successfully"], kind: "success", title: "Created" });
        onClose();
      }
    } catch (e: any) {
      const msgs = toMessageList(e);
      setErr(msgs[0] || "Failed to save");
      onSaved({ ok: false, messages: msgs, kind: "error", title: "Operation Failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
      <div className="w-[720px] rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>×</button>
        </div>

        {err && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="gov-select" className="text-sm text-gray-600">Governance</label>
            <select
              id="gov-select"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={sv(govId)}
              onChange={(e) => {
                setGovId(toNum(e.target.value));
                setStandardId(null);
                setStartDate("");
                setEndDate("");
              }}
              disabled={loading}
              required
            >
              <option value="">Select…</option>
              {governances.map((g) => (
                <option key={g.govId} value={g.govId}>{g.govDomainName}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="standard-select" className="text-sm text-gray-600">Standard</label>
            <select
              id="standard-select"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={sv(standardId)}
              onChange={(e) => {
                setStandardId(toNum(e.target.value));
                setStartDate("");
                setEndDate("");
              }}
              disabled={loading || !govId}
              required
            >
              <option value="">Select…</option>
              {standards.map((s) => (
                <option key={s.id} value={s.id}>{s.standardName}</option>
              ))}
              {!standards.length && <option disabled>No Standards Available</option>}
            </select>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="text-sm text-gray-600">Start Date</label>
            <input
              id="start-date"
              type="date"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading || !standardId}
              required
            />
          </div>
          <div>
            <label htmlFor="end-date" className="text-sm text-gray-600">End Date</label>
            <input
              id="end-date"
              type="date"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading || !standardId}
              required
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="auditor-select" className="text-sm text-gray-600">Auditor</label>
            <select
              id="auditor-select"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={sv(auditorUserId)}
              onChange={(e) => setAuditorUserId(toNum(e.target.value))}
              disabled={loading}
              required
            >
              <option value="">Select…</option>
              {auditors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="auditee-select" className="text-sm text-gray-600">Auditee</label>
            <select
              id="auditee-select"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={sv(auditeeUserId)}
              onChange={(e) => setAuditeeUserId(toNum(e.target.value))}
              disabled={loading}
              required
            >
              <option value="">Select…</option>
              {auditees.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-md bg-gray-100 px-4 py-2 text-gray-800" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            disabled={!canSubmit || loading}
            className={`rounded-md px-4 py-2 text-white ${!canSubmit || loading ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={handleSubmit}
          >
            {initial?.auditMasterId ? "Save Changes" : "Create Audit"}
          </button>
        </div>
      </div>
    </div>
  );
}
