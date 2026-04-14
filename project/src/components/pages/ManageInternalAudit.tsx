// src/pages/ManageInternalAudit.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, ArrowRight } from "lucide-react";
import {
  AuditRow,
  getAuditsForAuditor,
  startAudit,
  closeAudit,
  CloseAuditEnum,
} from "../../services/manageinternalauditservice";

/* ----------------------------- Helpers ----------------------------- */

const fromSession = (k: string) => window.sessionStorage.getItem(k) || "";

const parseUserIds = () => {
  let customerId = Number(fromSession("customerId"));
  let userId = Number(fromSession("userId"));
  let govid = Number(fromSession("govId"));

  try {
    const ud = JSON.parse(fromSession("userDetails") || "{}");
    if (Number.isFinite(ud?.customerId)) customerId = ud.customerId;
    if (Number.isFinite(ud?.userId)) userId = ud.userId;
  } catch {}
  try {
    const rd = JSON.parse(fromSession("roleDetails") || "{}");
    if (Number.isFinite(rd?.govid)) govid = rd.govid;
  } catch {}

  if (!Number.isFinite(customerId)) customerId = 4;
  if (!Number.isFinite(userId)) userId = 3;
  if (!Number.isFinite(govid)) govid = 1;
  return { customerId, userId, govid };
};

const fmtYMD = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

const pill = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("created"))
    return "bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold";
  if (s.includes("started"))
    return "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold";
  if (s.includes("completed"))
    return "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold";
  return "bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold";
};

/* ----------------------------- Popup ----------------------------- */

type PopupState =
  | { open: true; kind: "success" | "error"; title: string; message: string; onOk?: () => void }
  | { open: false };

function Popup({ state, setState }: { state: PopupState; setState: (s: PopupState) => void }) {
  if (!state.open) return null;
  const { kind, title, message, onOk } = state;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white w-[420px] max-w-[92vw] rounded-xl shadow-xl border border-gray-200 p-5">
        <div className="flex items-start gap-3">
          {kind === "success" ? (
            <svg className="w-6 h-6 text-green-600 mt-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-red-600 mt-0.5" viewBox="0 0 24 24" fill="none">
              <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
            </svg>
          )}
          <div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            onClick={() => {
              setState({ open: false });
              onOk?.();
            }}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Component ----------------------------- */

export default function ManageInternalAudit() {
  const navigate = useNavigate();
  const [{ customerId, userId, govid }] = useState(parseUserIds);

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [popup, setPopup] = useState<PopupState>({ open: false });

  // Load audits
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const list = await getAuditsForAuditor(customerId, userId);
        setRows(list);
      } catch (e: any) {
        setErr(e?.message || "Failed to load audits");
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId, userId]);

  const hasSelection = useMemo(() => Object.values(checked).some(Boolean), [checked]);

  const onToggle = (id: number, val: boolean) => {
    setChecked((p) => ({ ...p, [id]: val }));
  };

  const onStartOrContinue = async (row: AuditRow) => {
    const status = (row.auditStatus || "").toLowerCase();

    if (status.includes("created")) {
      try {
        setLoading(true);
        const res = await startAudit(customerId, row.auditMasterId);
        setPopup({
          open: true,
          kind: "success",
          title: "Success",
          message: res?.message || "Audit started.",
          onOk: () => {
            if (govid === 1) navigate("/portfolio/iso27000");
            else if (govid === 2) navigate("/portfolio/iso22301");
          },
        });
      } catch (e: any) {
        setPopup({ open: true, kind: "error", title: "Start Failed", message: e?.message || String(e) });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (status.includes("started")) {
      if (govid === 1) navigate("/portfolio/iso27000");
      else if (govid === 2) navigate("/portfolio/iso22301");
    }
  };

  const onCloseSelected = async () => {
    const ids = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => Number(k));
    if (ids.length === 0) return;

    try {
      setLoading(true);
      const id = ids[0]; // one at a time
      const res = await closeAudit(customerId, id, CloseAuditEnum.initialAuditclose);
      setPopup({
        open: true,
        kind: "success",
        title: "Audit Closed",
        message: res?.message || "Audit closed.",
        onOk: async () => {
          try {
            const list = await getAuditsForAuditor(customerId, userId);
            setRows(list);
            setChecked({});
          } catch {}
        },
      });
    } catch (e: any) {
      setPopup({ open: true, kind: "error", title: "Close Failed", message: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Popup state={popup} setState={setPopup} />
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Manage Internal Audit</h1>
        <button
          className={`px-4 py-2 rounded-md ${
            hasSelection ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!hasSelection || loading}
          onClick={onCloseSelected}
          title={hasSelection ? "Close selected audit" : "Select a row to close"}
        >
          Close Audit
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    const v = e.target.checked;
                    const next: Record<number, boolean> = {};
                    rows.forEach((r) => (next[r.auditMasterId] = v));
                    setChecked(next);
                  }}
                  checked={rows.length > 0 && rows.every((r) => checked[r.auditMasterId])}
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Audit Master ID</th>
              <th className="px-4 py-3">Standard</th>
              <th className="px-4 py-3">Compliance Period ID</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Auditee Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Auditor Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm">
            {rows.map((r) => {
              const status = r.auditStatus || "";
              const lower = status.toLowerCase();
              const isCreated = lower.includes("created");
              const isStarted = lower.includes("started");
              const isCompleted = lower.includes("completed");
              return (
                <tr key={r.auditMasterId} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={!!checked[r.auditMasterId]}
                      onChange={(e) => onToggle(r.auditMasterId, e.target.checked)}
                      aria-label={`select ${r.auditMasterId}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-blue-700 font-semibold hover:underline cursor-default">
                      {r.auditCode ?? `AUD-${String(r.auditMasterId).padStart(4, "0")}`}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.auditStandard || "—"}</td>
                  <td className="px-4 py-3">{r.compliancePeriodId || "—"}</td>
                  <td className="px-4 py-3">{fmtYMD(r.startdate) || "—"}</td>
                  <td className="px-4 py-3">{fmtYMD(r.enddate) || "—"}</td>
                  <td className="px-4 py-3">{r.auditeename || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={pill(status)}>{status || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      {isCreated && (
                        <button
                          onClick={() => onStartOrContinue(r)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-green-600 text-white font-medium hover:bg-green-700"
                          disabled={loading}
                        >
                          <Play className="w-4 h-4" />
                          Start Audit
                        </button>
                      )}

                      {isStarted && (
                        <button
                          onClick={() => onStartOrContinue(r)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                          disabled={loading}
                        >
                          <ArrowRight className="w-4 h-4" />
                          Continue Audit
                        </button>
                      )}

                      {isCompleted && <span className="text-green-600 font-semibold">Completed</span>}
                    </div>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && !loading && !err && (
              <tr>
                <td className="px-4 py-6 text-gray-600 text-sm" colSpan={9}>
                  No audits found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className="px-4 py-4 text-sm text-gray-600 border-t bg-white">Loading…</div>
        )}
        {!loading && err && (
          <div className="px-4 py-4 text-sm text-red-700 border-t bg-white">{err}</div>
        )}
      </div>
    </div>
  );
}
