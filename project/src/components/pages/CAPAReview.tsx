// src/components/pages/CAPAReview.tsx
import { useEffect, useMemo, useState } from "react";
import PopupMessages, { PopupKind } from "../popups/PopupMessages.tsx";
import {
  getCapaReview,
  getReviewControls,
  getControlInfo,
  closeCapaReview,
  type ReviewAuditRow,
  type ReviewControlRow,
} from "../../services/CAPAReviewservice.ts";
import CAPAReviewPopup from "../pages/CAPAReviewForm.tsx";

function useIdentity() {
  const safe = (v: string | null) => { try { return v ? JSON.parse(v) : null; } catch { return null; } };
  const ss = safe(sessionStorage.getItem("userDetails")) ?? safe(localStorage.getItem("userDetails"));
  const qs = new URLSearchParams(location.search);
  const customerId = Number(ss?.customerId ?? qs.get("customerId"));
  const userId = Number(ss?.userId ?? qs.get("userId"));
  return {
    customerId: Number.isFinite(customerId) ? customerId : undefined,
    userId: Number.isFinite(userId) ? userId : undefined,
  };
}

type PopupState = {
  open: boolean; kind: PopupKind; title?: string; message?: string | string[];
};

export default function CAPAReview() {
  const { customerId, userId } = useIdentity();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupState>({ open: false, kind: "info" });

  const [audits, setAudits] = useState<ReviewAuditRow[]>([]);
  const [selectedAudit, setSelectedAudit] = useState<ReviewAuditRow | null>(null);
  const [controls, setControls] = useState<ReviewControlRow[]>([]);
  const [openFor, setOpenFor] = useState<{ row: ReviewControlRow; controlInfo: any } | null>(null);

  const showPopup = (p: Omit<PopupState, "open">) => setPopup({ open: true, ...p });

  useEffect(() => {
    if (!customerId || !userId) {
      setErr("Missing customerId/userId (set sessionStorage.userDetails or use ?customerId=&userId=).");
      return;
    }
    setLoading(true);
    setErr(null);
    getCapaReview(customerId, userId)
      .then(setAudits)
      .catch(e => setErr(e?.message || "Failed to load CAPA Review list"))
      .finally(() => setLoading(false));
  }, [customerId, userId]);

  const viewAudit = async (audit: ReviewAuditRow) => {
    if (!customerId) return;
    setSelectedAudit(audit);
    setLoading(true);
    setErr(null);
    try {
      const rows = await getReviewControls(customerId, audit.auditMasterId);
      setControls(rows);
    } catch (e: any) {
      setErr(e?.message || "Failed to load controls");
      showPopup({ kind: "error", title: "Failed to load controls", message: e?.message || "Try again." });
    } finally {
      setLoading(false);
    }
  };

  const onCloseReview = async () => {
    if (!customerId || !selectedAudit) {
      showPopup({ kind: "warning", title: "Select an audit", message: "Pick an audit to close CAPA Review." });
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const msg: string = await closeCapaReview(selectedAudit.auditMasterId, customerId);
      showPopup({ kind: "success", title: "Audit closed", message: msg || "Audit closed successfully." });

      // refresh list + controls
      const [list, controlsNew] = await Promise.all([
        getCapaReview(customerId, userId!),
        getReviewControls(customerId, selectedAudit.auditMasterId),
      ]);
      setAudits(list);
      setControls(controlsNew);
    } catch (e: any) {
      const m = e?.message || "Error closing audit";
      setErr(m);
      showPopup({ kind: "error", title: "Close failed", message: m });
    } finally {
      setLoading(false);
    }
  };

  const header = useMemo(() => {
    if (!selectedAudit) return null;
    return (
      <div className="rounded-xl border p-4 mt-6">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Activity Master Details</div>
            <div className="font-semibold">AUD-{String(selectedAudit.auditMasterId).padStart(7, "0")}</div>
          </div>
          <div>
            <div className="text-gray-500">Standard</div>
            <div className="font-semibold">{selectedAudit.auditStandard}</div>
          </div>
          <div>
            <div className="text-gray-500">Auditee</div>
            <div className="font-semibold">{selectedAudit.auditee ?? "-"}</div>
          </div>
          <div>
            <div className="text-gray-500">Total Findings</div>
            <div className="font-semibold">{selectedAudit.findings ?? 0}</div>
          </div>
        </div>
      </div>
    );
  }, [selectedAudit]);

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* Breadcrumb-ish heading */}
      <div className="text-sm text-gray-500">Internal Audit / <span className="text-gray-800 font-medium">CAPA Review</span></div>
      <h1 className="text-2xl font-semibold mb-4">CAPA Review</h1>

      {err && (
        <div className="mb-3 text-sm rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{err}</div>
      )}

      {/* LIST TABLE (screenshot #1) */}
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium">
          <div className="col-span-2">Audit Master Id</div>
          <div className="col-span-2">Standard</div>
          <div className="col-span-1">Compliance Period Id</div>
          <div className="col-span-2">Start Date</div>
          <div className="col-span-1">End Date</div>
          <div className="col-span-1">Auditee Name</div>
          <div className="col-span-1">Initial Audit Status</div>
          <div className="col-span-1 text-center">Findings</div>
          <div className="col-span-1 text-center">View</div>
        </div>

        {audits.length === 0 && (
          <div className="px-4 py-6 text-sm text-gray-600">No audits to display.</div>
        )}

        {audits.map((a) => (
          <label key={a.auditMasterId} className="grid grid-cols-12 items-center px-4 py-3 border-t">
            <div className="col-span-2 flex items-center gap-3">
              <input
                type="radio"
                name="selectedAudit"
                className="accent-black"
                checked={selectedAudit?.auditMasterId === a.auditMasterId}
                onChange={() => setSelectedAudit(a)}
              />
              <span className="font-medium">AUD-{String(a.auditMasterId).padStart(7, "0")}</span>
            </div>
            <div className="col-span-2">{a.auditStandard}</div>
            <div className="col-span-1">{a.compliancePeriodId}</div>
            <div className="col-span-2">{a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "-"}</div>
            <div className="col-span-1">{a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "-"}</div>
            <div className="col-span-1">{a.auditee ?? "-"}</div>
            <div className="col-span-1">
              <span className="inline-flex items-center gap-1 rounded-2xl text-xs px-3 py-1 bg-green-100 text-green-800">
                Initial Audit Completed
              </span>
            </div>
            <div className="col-span-1 text-center">⚠ {a.findings ?? 0}</div>
            <div className="col-span-1 text-center">
              <button
                className="rounded-lg text-blue-600 hover:bg-blue-50 px-3 py-1.5 text-sm"
                onClick={() => viewAudit(a)}
                title="View"
              >
                👁️
              </button>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={onCloseReview}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!selectedAudit || loading}
        >
          Close CAPA Review
        </button>
      </div>

      {/* DETAILS HEADER (screenshot #2 top card) */}
      {header}

      {/* CONTROLS TABLE (screenshot #2 bottom table) */}
      {!!controls.length && (
        <>
          <h2 className="text-lg font-semibold mt-6 mb-3">
            Control CAPA Review {selectedAudit ? `- AUD-${String(selectedAudit.auditMasterId).padStart(7, "0")}` : ""}
          </h2>
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium">
              <div className="col-span-1">
                <input type="checkbox" disabled />
              </div>
              <div className="col-span-1">Sl. No</div>
              <div className="col-span-5">Control Title</div>
              <div className="col-span-2">Audit Start Date</div>
              <div className="col-span-1">Auditee</div>
              <div className="col-span-1">Initial Audit Status</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {controls.map((c) => (
              <div key={c.auditControlId} className="grid grid-cols-12 items-center px-4 py-3 border-t">
                <div className="col-span-1">
                  <input type="checkbox" disabled />
                </div>
                <div className="col-span-1">{c.slNo ?? c.auditControlId}</div>
                <div className="col-span-5">{c.controlTitle}</div>
                <div className="col-span-2">{c.auditStartDate ? new Date(c.auditStartDate).toISOString().slice(0, 10) : "-"}</div>
                <div className="col-span-1">{c.auditee ?? "-"}</div>
                <div className="col-span-1">
                  <span className="rounded-2xl text-xs px-3 py-1 bg-gray-100">{c.initialAuditStatus}</span>
                </div>
                <div className="col-span-1 text-center">
                  <button
                    className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm"
                    onClick={async () => {
                      const info = await getControlInfo(c.auditControlId, customerId!);
                      setOpenFor({ row: c, controlInfo: info });
                    }}
                  >
                    Review CAPA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {loading && <div className="mt-3 text-sm text-gray-500">Loading…</div>}

      {/* review popup (screenshot #3 & #4) */}
      {openFor && selectedAudit && customerId && (
        <CAPAReviewPopup
          open
          customerId={customerId}
          auditMasterId={selectedAudit.auditMasterId}
          row={openFor.row}
          controlInfo={openFor.controlInfo}
          onClose={async (didSubmit) => {
            setOpenFor(null);
            if (didSubmit && selectedAudit && customerId) {
              const rows = await getReviewControls(customerId, selectedAudit.auditMasterId);
              setControls(rows);
            }
          }}
        />
      )}

      {/* global popup */}
      <PopupMessages
        open={popup.open}
        kind={popup.kind}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
      />
    </div>
  );
}