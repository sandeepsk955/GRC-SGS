import { useEffect, useState } from "react";
import {
  AuditRow,
  ControlRow,
  closeCapaUpdate,
  getCapaUpdate,
  getControlsForAudit,
} from "../../services/CAPAUpdateservice";
import CAPAUpdateForm from "./CAPAUpdateForm";

// ⬇️ use your existing popup
import PopupMessages, { PopupKind } from "../popups/PopupMessages.tsx";

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
  open: boolean;
  kind: PopupKind;
  title?: string;
  message?: string | string[];
  actions?: { label: string; onClick: () => void; variant?: "primary" | "secondary" }[];
};

export default function CAPAUpdate() {
  const { customerId, userId } = useIdentity();

  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [controls, setControls] = useState<ControlRow[]>([]);
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [openFor, setOpenFor] = useState<ControlRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [popup, setPopup] = useState<PopupState>({ open: false, kind: "info" });

  const showPopup = (p: Omit<PopupState, "open"> & { open?: boolean }) =>
    setPopup({ open: true, ...p });

  useEffect(() => {
    if (!customerId || !userId) {
      setErr("Missing customerId/userId (set sessionStorage.userDetails or use ?customerId=&userId=).");
      return;
    }
    let alive = true;
    setLoading(true);
    setErr(null);
    getCapaUpdate(customerId, userId)
      .then((rows) => alive && setAudits(rows))
      .catch((e) => setErr(e?.message || "Failed to load CAPA list"))
      .finally(() => setLoading(false));
    return () => { alive = false; };
  }, [customerId, userId]);

  const viewAudit = async (auditMasterId: number) => {
    if (!customerId) return;
    setSelectedAuditId(auditMasterId);
    setLoading(true);
    setErr(null);
    try {
      const rows = await getControlsForAudit(customerId, auditMasterId);

      // Fallback auditor name from the selected audit (if controls don't carry it)
      const parentAudit = audits.find(a => a.auditMasterId === auditMasterId);
      const parentAuditor = parentAudit?.auditorName;

      const withFallback = rows.map((r) => ({
        ...r,
        auditorName: r.auditorName ?? parentAuditor ?? "-",
      }));

      setControls(withFallback);
    } catch (e: any) {
      setErr(e?.message || "Failed to load controls");
      showPopup({
        kind: "error",
        title: "Failed to load controls",
        message: e?.message || "Error while fetching control records.",
      });
    } finally {
      setLoading(false);
    }
  };

  const onCloseCapa = async () => {
    if (!selectedAuditId || !customerId || !userId) {
      showPopup({
        kind: "warning",
        title: "Missing selection",
        message: "Select an audit and ensure customerId/userId are present.",
      });
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const serverMsg: string = await closeCapaUpdate(selectedAuditId, customerId);
      showPopup({
        kind: "success",
        title: "Audit closed",
        message: serverMsg || "Audit closed — it will go to Auditor for review.",
      });

      const [list, details] = await Promise.all([
        getCapaUpdate(customerId, userId),
        getControlsForAudit(customerId, selectedAuditId),
      ]);

      // keep the same fallback after refresh
      const parentAudit = list.find(a => a.auditMasterId === selectedAuditId);
      const parentAuditor = parentAudit?.auditorName;
      const withFallback = details.map((r) => ({
        ...r,
        auditorName: r.auditorName ?? parentAuditor ?? "-",
      }));

      setAudits(list);
      setControls(withFallback);
    } catch (e: any) {
      const msg = e?.message || "Error closing audit";
      setErr(msg);
      showPopup({
        kind: "error",
        title: "Close CAPA failed",
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold mb-4">CAPA Update</h1>

      {err && (
        <div className="mb-3 text-sm rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">
          {err}
        </div>
      )}

      {/* First table */}
      <div className="rounded-xl border overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium">
          <div className="col-span-2">Audit master id</div>
          <div className="col-span-1">Standard</div>
          <div className="col-span-2">Compliance id</div>
          <div className="col-span-1">Start date</div>
          <div className="col-span-1">End date</div>
          <div className="col-span-2">Auditor name</div>
          <div className="col-span-1">Status</div>
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
                checked={selectedAuditId === a.auditMasterId}
                onChange={() => setSelectedAuditId(a.auditMasterId)}
              />
              <span className="font-medium">AUD-{String(a.auditMasterId).padStart(7, "0")}</span>
            </div>
            <div className="col-span-1">{a.auditStandard}</div>
            <div className="col-span-2">{a.compliancePeriodId}</div>
            <div className="col-span-1">
              {a.startDate ? new Date(a.startDate).toISOString().slice(0, 10) : "-"}
            </div>
            <div className="col-span-1">
              {a.endDate ? new Date(a.endDate).toISOString().slice(0, 10) : "-"}
            </div>
            <div className="col-span-2">{a.auditorName ?? "-"}</div>
            <div className="col-span-1">{a.auditStatus ?? "-"}</div>
            <div className="col-span-1 text-center">⚠ {a.findingsCount ?? 0}</div>
            <div className="col-span-1 text-center">
              <button
                className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm"
                onClick={() => viewAudit(a.auditMasterId)}
              >
                View
              </button>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={onCloseCapa}
          className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
          disabled={!selectedAuditId || loading}
        >
          Close CAPA
        </button>
      </div>

      {/* Second table */}
      {!!controls.length && (
        <>
          <h2 className="text-lg font-semibold mt-8 mb-3">Control CAPA Review</h2>
          <div className="rounded-xl border overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 px-4 py-3 text-sm font-medium">
              <div className="col-span-1">Audit id</div>
              <div className="col-span-5">Control title</div>
              <div className="col-span-2">Audit start date</div>
              <div className="col-span-2">Auditor name</div>
              <div className="col-span-1">Initial audit status</div>
              <div className="col-span-1 text-center">Action</div>
            </div>

            {controls.map((c) => (
              <div key={c.auditControlId} className="grid grid-cols-12 items-center px-4 py-3 border-t">
                <div className="col-span-1">{c.slNo ?? c.auditControlId}</div>
                <div className="col-span-5">{c.controlTitle}</div>
                <div className="col-span-2">
                  {c.auditStartDate ? new Date(c.auditStartDate).toISOString().slice(0, 10) : "-"}
                </div>
                <div className="col-span-2">{c.auditorName ?? "-"}</div>
                <div className="col-span-1">
                  <span className="rounded-2xl text-xs px-3 py-1 bg-gray-100">
                    {c.initialAuditStatus}
                  </span>
                </div>
                <div className="col-span-1 text-center">
                  <button
                    className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm"
                    onClick={() => setOpenFor(c)}
                  >
                    Review CAPA
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {openFor && customerId && (
        <CAPAUpdateForm
          open
          controlRow={openFor}
          customerId={customerId}
          onClose={async (didSubmit) => {
            setOpenFor(null);
            if (didSubmit && selectedAuditId && customerId && userId) {
              const [list, details] = await Promise.all([
                getCapaUpdate(customerId, userId),
                getControlsForAudit(customerId, selectedAuditId),
              ]);

              const parentAudit = list.find(a => a.auditMasterId === selectedAuditId);
              const parentAuditor = parentAudit?.auditorName;
              const withFallback = details.map((r) => ({
                ...r,
                auditorName: r.auditorName ?? parentAuditor ?? "-",
              }));

              setAudits(list);
              setControls(withFallback);
            }
          }}
        />
      )}

      {loading && <div className="mt-3 text-sm text-gray-500">Loading…</div>}

      {/* Global popup */}
      <PopupMessages
        open={popup.open}
        kind={popup.kind}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
        actions={popup.actions}
      />
    </div>
  );
}
